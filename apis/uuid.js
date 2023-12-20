var md5 = require('md5');
const crypto = require("crypto")

let namespace;
let name;

function generateVersion5UUID(namespace, name) {
  // Parse the namespace UUID
  const namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');

  // Concatenate and hash using SHA-1
  const combinedData = Buffer.concat([namespaceBuffer, Buffer.from(name)]);
  const hashValue = crypto.createHash('sha1').update(combinedData).digest();

  // Modify version and variant bits
  const uuidBytes = Buffer.from(hashValue);
  uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x50;
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

  // Format the UUID
  const uuidString = `${uuidBytes.toString('hex', 0, 4)}-${uuidBytes.toString('hex', 4, 6)}-${uuidBytes.toString('hex', 6, 8)}-${uuidBytes.toString('hex', 8, 10)}-${uuidBytes.toString('hex', 10, 16)}`

  return uuidString;
}
function generateVersion3UUID(namespace, name) {
  // Parse the namespace UUID
  const namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');

  // Concatenate and hash
  const combinedData = Buffer.concat([namespaceBuffer, Buffer.from(name)]);
  const hashValue = md5(combinedData);

  // Modify version and variant bits
  const uuidBytes = Buffer.from(hashValue, 'hex');
  uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x30;
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

  // Format the UUID
  const uuidString = `${uuidBytes.toString('hex', 0, 4)}-${uuidBytes.toString('hex', 4, 6)}-${uuidBytes.toString('hex', 6, 8)}-${uuidBytes.toString('hex', 8, 10)}-${uuidBytes.toString('hex', 10)}`

  return uuidString;
}

function makeid(length) {
  var result = '';
  var characters = 'abcdef0123456789';
  for (var i = 0; i < Number(length); i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function sid() {
  var characters = '89ab';
  return characters.charAt(Math.floor(Math.random() * characters.length));
}

module.exports = {
  path: '/uuid',
  info: 'Generates random uuid (set version to help for list of versions)',
  type: 'get',
  params: ["version", false, "space", false, "name", false],
  category: "text",
  execute(req, res){
    if (!req.query["version"]) {
      res.send(`{"uuid": "${makeid(8)}-${makeid(4)}-4${makeid(3)}-${sid()}${makeid(3)}-${makeid(12)}"}`)
      return;
    }
    switch (req.query["version"]) {
      case 'help':
        res.send(`Version list (uses DCE 1.1, ISO/IEC 11578:1996 variant)
<br><br>
3 - predictible uuid from name, requires "space" and "name" parameters, space must be exactly url, dns, oid, x500 or a valid uuid<br>
4 - random unique uuid<br>
5 - same as 3 but uses a different hashing algorithym<br>
nil - non unique uuid for testing
<br><br>
More soon`)
        return;
      case "5":
        namespace = req.query["space"];
        name = req.query["name"];

        if (namespace == "url") namespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == "dns") namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == "oid") namespace = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == 'x500') namespace = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
                
        res.send(`{"uuid": "${generateVersion5UUID(namespace, name)}"}`)
        return;
      case "4":
        res.send(`{"uuid": "${makeid(8)}-${makeid(4)}-3${makeid(3)}-${sid()}${makeid(3)}-${makeid(12)}"}`)
        return;
      case "3":
        namespace = req.query["space"];
        name = req.query["name"];

        if (namespace == "url") namespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == "dns") namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == "oid") namespace = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
        if (namespace == 'x500') namespace = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
                
        res.send(`{"uuid": "${generateVersion3UUID(namespace, name)}"}`)
        return;
      case "nil":
        res.send(`{"uuid": "00000000-0000-0000-0000-000000000000"}`)
        return;
    }
    try {
      res.send(`{"err":"true","msg":"No valid version specified"}`)
    } catch (err) {}
  }
}