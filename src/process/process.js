function ChildSendMessage(json, nodename) {
    let msg = {"data": json, "nodename" : nodename};
    process.send(msg);
}
module.exports = { 
    ChildSendMessage
}; 