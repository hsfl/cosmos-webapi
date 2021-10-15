const express = require('express');
const router = express.Router();

const CosmosAgent = require('../utils/agent');

/**   route GET /telegraf/
test this with :
    curl --request GET \
      --header "Content-Type: application/json" \
      http://localhost:8082/telegraf/
*/
router.get('/', (req, res) => {
  sohs = [];
  console.log(shared);
  shared.heartbeats.tel = 'tel';
  console.log(shared);
  const sohPromiseList = Object.keys(shared.heartbeats).map(a => {
    const node = shared.heartbeats[a].agent_node;
    const agent = shared.heartbeats[a].agent_proc;
    const nodeProcess = [node, agent].join(':');
    return new Promise((resolve) => {
      /*CosmosAgent.AgentReqByHeartbeat(heartbeats[a], 'soh', 3000, (resp) => {
        if(typeof resp === 'string') {
          const json_begin = resp.indexOf('{');
          const json_end = resp.lastIndexOf('}');
          try {
            if(json_begin < json_end) {
              const json = resp.substr(json_begin, json_end+1);
              const soh = JSON.parse(json);
              console.log('soh:', soh);
              resolve();
            }
          }
          catch(e) {
            console.log(resp);
            console.log(e);
            resolve();
          }
        }
      });*/



      setTimeout(() => {
        sohs.push('hi');
        resolve();
      }, 800);
    });
  });
  Promise.allSettled(sohPromiseList).then(() => {
    res.json(sohs);
  });
  // Get SOHs for all visible agents
  /*const sohPromises = Object.keys(heartbeats).map(a => {
    const node = heartbeats[a].agent_node;
    const agent = heartbeats[a].agent_proc;
    const nodeProcess = [node, agent].join(':');
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(33), 300);
        /*CosmosAgent.AgentReqByHeartbeat(heartbeats[a], 'soh', 3000, (resp) => {
        console.log('here1');
        if(typeof resp === 'string') {
            const json_begin = resp.indexOf('{');
            const json_end = resp.lastIndexOf('}');
            console.log('here2');
            try {
                if(json_begin < json_end) {
                    const json = resp.substr(json_begin, json_end+1);
                    const soh = JSON.parse(json);
                    if(!soh.node_utc) soh.node_utc = currentMJD();
                    if(!soh.agent_name) soh.agent_name = agent;
                    if(!soh.node_name) soh.node_name = node;
                    soh.node_type = nodeProcess;
                    sohs.append(soh);
                    console.log('here3');
                    resolve();
                }
            } catch (e) {
                console.log(resp);
                console.log(e);
                reject();
            }
        }
    })
});
  });*/
  //console.log(sohPromises);
  /*Promise.allSettled(sohPromises).then(() => {
      console.log('done');
      res.json(sohs);
  });*/
});

module.exports = router;
