
module.exports.SendToParentProcess = (json, nodename) => {
    let msg = {"data": json, "node" : nodename};
    process.send(JSON.stringify(msg));
}