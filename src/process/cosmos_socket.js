const COSMOS_ADDR = "225.1.1.1";
const COSMOS_PORT = 10020;
const COSMOS_PORT_EXTERNAL = 10021;
const TELEGRAF_HEARTBEAT_PORT = 10022;

const dayjs = require('dayjs');
const dgram = require('dgram');
const { SendToParentProcess } = require("../utils/child_process");
const CosmosAgent = require('../utils/agent');
const { dbInsertByUTC } = require('../database');

const { getDiff, MJD2daysjs, currentMJD } = require('../utils/time');
const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.bind(COSMOS_PORT);
socket.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  socket.close();
});

socket.on('listening', () => {
  socket.addMembership(COSMOS_ADDR);
  var address = socket.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

const heartbeats = {};
let agent_exec_count = 0;

/**
 * COSMOS LISTEN LOOP
 */
socket.on('message', (msg, rinfo) => {
    // read heartbeat from beginning of message
    // console.log(`[MSGTYPE] ${msg[0]}`);
    if(msg.indexOf('{') < msg.indexOf('}')) {
        const beatstr = msg.subarray(msg.indexOf('{'), msg.indexOf('}')+1).toString();
        try {
            const beat = JSON.parse(beatstr);
            addAgentToList(beat);
            const node = beat.agent_node; 
            const telegraf_socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
            telegraf_socket.send(beatstr, TELEGRAF_HEARTBEAT_PORT, '127.0.0.1');
            if(msg[0] == CosmosAgent.AgentMessageType.SOH ){
                if(msg.indexOf('}') < msg.lastIndexOf('}')) {
                    const sohstr = msg.subarray(msg.indexOf('}') +1, msg.lastIndexOf('}')+1).toString();
                    const soh = JSON.parse(sohstr);
                    //SendToParentProcess(soh, node);
                }
            } 

        } catch(e) {
            console.log(e);
        }
    }
});

const socket_external = dgram.createSocket({ type: "udp4", reuseAddr: true });
socket_external.bind(COSMOS_PORT_EXTERNAL);
socket_external.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socket_external.close();
});

socket_external.on('listening', () => {
    socket_external.addMembership(COSMOS_ADDR);
    var address = socket_external.address();
    console.log(`server listening ${address.address}:${address.port}`);
});
socket_external.on('message', (msg, rinfo) => { 
    try {
        const soh = JSON.parse(msg);
        if(!soh.node_utc) soh.node_utc = currentMJD();
        if(!soh.agent_name) soh.agent_name = 'external_agent';
        if(!soh.node_name) soh.node_name = 'external_node';
        soh.node_type = [soh.node_name, soh.agent_name].join(':');
        //SendToParentProcess(soh, 'any');
    } catch(e) {
        console.log(e);
    }
});
/**
 * 
 * @param { Object } beat 
 */
function addAgentToList(beat) {
    // console.log(beat);
    try{
        if(beat.agent_utc && beat.agent_proc && beat.agent_node) {
            heartbeats[`${beat.agent_node}:${beat.agent_proc}`] = beat;
        }
        if(beat.agent_proc === 'exec'){
            agent_exec_count++;
        }
    } catch(e) {
        console.log(e);
    }
    
}

/**
 * agent list loop - send list of active agents every 5 sec.
 */
setInterval(() => {
    Object.keys(heartbeats).forEach(a => {
        if(getDiff(MJD2daysjs(heartbeats[a].agent_utc)).minute() > 0){
            // console.log(`LOST AGENT ${heartbeats[a].agent_proc}`);
            if(heartbeats[a].agent_proc) {
                agent_exec_count--;
                if(agent_exec_count < 0) agent_exec_count = 0;
            }
            delete heartbeats[a];
        } 
    });
    //SendToParentProcess(heartbeats, "heartbeat");
}, 5000);

/**
 * send heartbeat request every 60 seconds to maintain agent list
 */
setInterval(() => {
    // if there is an agent exec running, then soh are already posted 
    if(agent_exec_count <= 0){
        socket.send(
            CosmosAgent.AgentChannelMessageBuf(CosmosAgent.AgentMessageType.REQUEST, "heartbeat"),
            COSMOS_PORT,
            COSMOS_ADDR
        );
    }
}, 60000);

// Listen for messages from parent process
process.on('message', (message) => {
  switch (message.caller) {
    case 'getSOHs':
      console.log('message receieved from getSOHs');
      getSOHs(message);
      break;
    default:
      console.log('No matching caller!');
  }
});

// Request SOHs from all visible agents
const getSOHs = (message) => {
  sohs = [];
  // Create list of promises that resolve with agent SOH reponses
  const sohPromiseList = Object.keys(heartbeats).map(a => {
    const node = heartbeats[a].agent_node;
    const agent = heartbeats[a].agent_proc;
    const nodeProcess = [node, agent].join(':');
    return new Promise((resolve) => {
      CosmosAgent.AgentReqByHeartbeat(heartbeats[a], 'soh', 3000, (resp) => {
        if(typeof resp === 'string') {
          const json_begin = resp.indexOf('{');
          const json_end = resp.lastIndexOf('}');
          try {
            if(json_begin < json_end) {
              const json = resp.substr(json_begin, json_end+1);
              const soh = JSON.parse(json);
              if(!soh.node_utc) soh.node_utc = currentMJD();
              if(!soh.agent_name) soh.agent_name = agent;
              if(!soh.node_name) soh.node_name = node;
              soh.node_type = nodeProcess;
              sohs.push(soh);
              resolve();
            }
          }
          catch(e) {
            console.log(resp);
            console.log(e);
            resolve();
          }
        }
      });
    });
  });
  // Wait for all agents to respond with their sohs, then send back to parent process
  Promise.allSettled(sohPromiseList).then(() => {
    process.send({ ...message, ...{ response: sohs }});
  });
};

//! get agent soh at 5 sec interval
/*setInterval(() => {
    Object.keys(heartbeats).forEach(a => {
        const node = heartbeats[a].agent_node;
        const agent = heartbeats[a].agent_proc;
        const nodeProcess = [node, agent].join(':');
        CosmosAgent.AgentReqByHeartbeat(heartbeats[a], 'soh', 3000, (resp) => {
            if(typeof resp === 'string') {
                const json_begin = resp.indexOf('{');
                const json_end = resp.lastIndexOf('}');
                try {
                    if(json_begin < json_end) {
                        const json = resp.substr(json_begin, json_end+1);
                        const soh = JSON.parse(json);
                        if(!soh.node_utc) soh.node_utc = currentMJD();
                        if(!soh.agent_name) soh.agent_name = agent;
                        if(!soh.node_name) soh.node_name = node;
                        soh.node_type = nodeProcess;
                        dbInsertByUTC([node,'soh'].join(':'), soh, () => {
                            SendToParentProcess(soh, node);
                        });
                    }
                } catch (e) {
                    console.log(resp);
                    console.log(e);
                }
            }
        });
    });
}, 5000);*/