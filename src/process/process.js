
/**
 * 
 * @param {Object} data 
 * @param {String} nodename 
 */
const SendToParentProcess = (data, nodename) => {
    let msg = {"data": data, "node" : nodename};
    process.send(JSON.stringify(msg));
}
module.exports = {
    SendToParentProcess,
};