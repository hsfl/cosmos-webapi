const COSMOS_ADDR = "225.1.1.1";
const COSMOS_PORT = 10020;

const dgram = require('dgram');
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

socket.on('message', (msg, rinfo) => {
    var mess = msg.slice(3);
    console.log(JSON.parse(mess));
  //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});




// 225.1.1.1 
// listen 10021