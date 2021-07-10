/** Returns the object at the index of the base object,
 *   and creates a new object at the index if it does not exist
 */
const getObjectAtIdx = (currentRef, nextIdx, createObjIfUndefined = true) => {
  if (currentRef[nextIdx] === undefined && createObjIfUndefined) {
    const cr = currentRef;
    cr[nextIdx] = {};
  }
  return currentRef[nextIdx];
};

/** From the raw name and type output from cosmos, parse into a usable json.
 *  Formatted like the following:
 *  {
 *    'agent': {
 *      'type_of_name': 'vector<agentstruc>',
 *      0: {
 *        'type_of_name': 'agentstruc',
 *        'aprd': { 'type_of_name': 'double' },
 *        'beat': {
 *          'type_of_name': 'beatstruc',
 *          'addr': { 'type_of_name': 'char[]' },
 *          ...
 *        },
 *        ...
 *      },
 *      ...
 *    },
 *    ...
 *  }
 */
const ParseNamesToJSON = (raw) => {
  const parsedJson = {};
  // Split by newline
  const lines = raw.split('\n');
  // Iterate over lines
  lines.forEach((line) => {
    // Split into name and type, delimiter is comma followed by tab
    const [fullname, type] = line.split(/,\t/);
    // Remove ']', then split on '.' and '['
    const idxs = fullname.replace(/\]/g, '').split(/\.|\[/);
    // For each indexes, create new objects in parsedJson
    let currentRef = parsedJson;
    idxs.forEach((idx) => {
      currentRef = getObjectAtIdx(currentRef, idx);
    });
    currentRef.type_of_name = type;
  });
  return parsedJson;
};

module.exports = {
  ParseNamesToJSON,
};