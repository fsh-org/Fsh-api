const crypto = require('node:crypto');

let namespace;
let name;

function generateVersion5UUID(namespace, name) {
  // Parse the namespace UUID
  const namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');

  // Concatenate and hash
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
  const hashValue = crypto.createHash('md5').update(combinedData).digest();

  // Modify version and variant bits
  const uuidBytes = Buffer.from(hashValue);
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
  return characters.charAt(Math.floor(Math.random() * 4));
}
function upd(namespace) {
  if (namespace == 'dns') namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  if (namespace == 'url') namespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  if (namespace == 'oid') namespace = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
  if (namespace == 'x500') namespace = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
  return namespace;
}

module.exports = {
  path: '/uuid',
  info: 'Generates random uuid (set version to help for list of versions)',
  type: 'get',
  params: [
    {
      name: 'version',
      required: false,
      default: '4'
    },
    {
      name: 'space',
      required: false,
      default: ''
    },
    {
      name: 'name',
      required: false,
      default: ''
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['version']) {
      res.json({
        uuid: `${makeid(8)}-${makeid(4)}-4${makeid(3)}-${sid()}${makeid(3)}-${makeid(12)}`
      })
      return;
    }
    switch (req.query['version']) {
      case 'help':
        res.send(`Version list (uses DCE 1.1, ISO/IEC 11578:1996 variant)<br><br>nil/null/0 - non unique uuid for testing<br>3 - predictible uuid from name, requires "space" and "name" parameters, space must be exactly url, dns, oid, x500 or a valid uuid<br>4 - random unique uuid<br>5 - same as 3 but uses a different hashing algorithym<br><br>More soon`)
        return;
      case '5':
      case '3':
        namespace = upd(req.query['space']);
        name = req.query['name'];
        if (!namespace || !name) {
          res.error('Include a name and namespace');
          return;
        }
        res.json({
          uuid: req.query['version'] === '5' ? generateVersion5UUID(namespace, name) : generateVersion3UUID(namespace, name)
        })
        return;
      case '4':
        res.json({
          uuid: `${makeid(8)}-${makeid(4)}-4${makeid(3)}-${sid()}${makeid(3)}-${makeid(12)}`
        })
        return;
      case 'nil':
      case 'null':
      case '0':
        res.json({
          uuid: '00000000-0000-0000-0000-000000000000'
        })
        return;
    }
    res.error('No valid version specified')
  }
}