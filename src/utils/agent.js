const dgram = require('dgram');

const AgentMessageType = {
    BEAT: 2,
    SOH: 3,
    REQUEST: 10, 
    RESPONSE: 11,
};

/**
 * 
 * @param {String} node 
 * @param {String} proc 
 * @param {String} request 
 * @param {Number} waitms 
 * @param {function (resp) } callback
 */
function AgentRequest(node, proc, request, waitms, callback) {
    try {
        const nodeProc = [node, proc].join(':');
        if(global.heartbeats[nodeProc]) {
            const agent = global.heartbeats[nodeProc];
            AgentReqByAddr(request, agent.agent_port, agent.agent_addr, waitms, callback);
        } else {
            callback({ error: 'agent not available'});
        }
    } catch (e) {
        console.log(e); 
    }
}

function AgentReqByHeartbeat(heartbeat, request, waitms, callback) {
    if(heartbeat.agent_port && heartbeat.agent_addr){
        AgentReqByAddr(request, heartbeat.agent_port, heartbeat.agent_addr, waitms, callback);
    } else {
        callback({ error: 'agent not available'});
    }
}

function AgentReqByAddr(request, agent_port, agent_addr, waitms, callback){
    if(agent_port > 0) {
        const req = AgentMessageBuf(AgentMessageType.REQUEST, request);
        const agent_socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
        agent_socket.send(req, agent_port, agent_addr)
        var resp = '';
        agent_socket.on('message', (msg, rinfo) => {
            resp += msg.toString(); 
        });
        const socketTimeout = setTimeout(() => {
            agent_socket.close();
            callback(resp);
        }, waitms);
    } else {
        callback({ error: 'agent not available'});
    }
}

/**
 * 
 * @param {Number} type 
 * @param {String} message 
 * @returns {Buffer}
 */
 function AgentMessageBuf(type, message) {
    const buf = Buffer.alloc(message.length +3 );
    buf.write(message, 0, 'utf-8');
    return buf;
}

module.exports = {
    AgentRequest,
    AgentMessageBuf,
    AgentMessageType,
    AgentReqByHeartbeat
};