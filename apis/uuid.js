const crypto = require('node:crypto');

const EPOCH_OFFSET = 12219292800000n;

function v1UUID() {
  let now = (BigInt(Date.now()) + EPOCH_OFFSET) * 10000n;

  let timeLow = Number(now & 0xffffffffn);
  let timeMid = Number((now >> 32n) & 0xffffn);
  let timeHi = Number((now >> 48n) & 0x0fffn);

  // Random
  let clockSeq = crypto.randomBytes(2);
  clockSeq[0] = (clockSeq[0] & 0x3f) | 0x80;
  let node = crypto.randomBytes(6);

  return [
    timeLow.toString(16).padStart(8, '0'),
    timeMid.toString(16).padStart(4, '0'),
    (timeHi | 0x1000).toString(16).padStart(4, '0'),
    clockSeq.toString('hex'),
    node.toString('hex')
  ].join('-');
}
function namespaceUUID(version, namespace, name) {
  // Parse the namespace UUID
  const namespaceBuffer = Buffer.from(namespace.replace(/-/g, ''), 'hex');

  // Concatenate and hash
  const combinedData = Buffer.concat([namespaceBuffer, Buffer.from(name)]);
  const hashValue = crypto.createHash(version==='3'?'md5':'sha1').update(combinedData).digest();

  // Modify version and variant bits
  const uuidBytes = Buffer.from(hashValue);
  uuidBytes[6] = (uuidBytes[6] & 0x0f) | (version==='3'?0x30:0x50);
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;

  return `${uuidBytes.toString('hex', 0, 4)}-${uuidBytes.toString('hex', 4, 6)}-${uuidBytes.toString('hex', 6, 8)}-${uuidBytes.toString('hex', 8, 10)}-${uuidBytes.toString('hex', 10, 16)}`;
}
function v6UUID() {
  // UUID epoch offset
  let timestamp = (BigInt(Date.now()) + EPOCH_OFFSET) * 10000n;

  // Rearrange timestamp
  let timeHigh = Number((timestamp >> 28n) & 0xffffffffn);
  let timeMid = Number((timestamp >> 12n) & 0xffffn);
  let timeLow = Number(timestamp & 0xfffn);

  // Random data
  let clockSeq = crypto.randomBytes(2).readUInt16BE() & 0x3fff;
  let node = crypto.randomBytes(6);

  return [
    timeHigh.toString(16).padStart(8, '0'),
    timeMid.toString(16).padStart(4, '0'),
    ((0x6000 | timeLow).toString(16)).padStart(4, '0'),
    ((0x8000 | clockSeq).toString(16)).padStart(4, '0'),
    node.toString('hex')
  ].join('-');
}
function v7UUID() {
  let bytes = crypto.randomBytes(16);

  const now = BigInt(Date.now());

  bytes[0] = Number((now >> 40n) & 0xffn);
  bytes[1] = Number((now >> 32n) & 0xffn);
  bytes[2] = Number((now >> 24n) & 0xffn);
  bytes[3] = Number((now >> 16n) & 0xffn);
  bytes[4] = Number((now >> 8n) & 0xffn);
  bytes[5] = Number(now & 0xffn);

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  let hex = [...bytes].map(b=>b.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 12).join(''),
    hex.slice(12, 16).join('')
  ].join('-')
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
  info: 'Generates uuids (set version to help for list of versions)',
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
        uuid: crypto.randomUUID()
      });
      return;
    }
    switch (req.query['version']) {
      case 'help':
        res.type('text/html').send(`Version list (uses DCE 1.1, ISO/IEC 11578:1996 variant)<br><br>
nil/null/0 - non unique uuid for testing<br>
1 - Pseudo random timestamp generated uuid<br>
3 - Predictible uuid from a name and namespace (space & name parameters), space can be url, dns, oid, x500 or a valid uuid<br>
4 - Random uuid<br>
5 - Same as 3 but different hashing<br>
6 - Similar to 1 but better sorting<br>
7 - Similar to 6 but unix timestamp`);
        return;
      case 'nil':
      case 'null':
      case '0':
        res.json({
          uuid: '00000000-0000-0000-0000-000000000000'
        });
        return;
      case '1':
        res.json({
          uuid: v1UUID()
        });
        return
      case '5':
      case '3':
        let namespace = upd(req.query['space']);
        let name = req.query['name'];
        if (!namespace || !name) {
          res.error('Include a name and namespace');
          return;
        }
        res.json({
          uuid: namespaceUUID(req.query['version'], namespace, name)
        });
        return;
      case '4':
        res.json({
          uuid: crypto.randomUUID()
        });
        return;
      case '6':
        res.json({
          uuid: v6UUID()
        });
        return
      case '7':
        res.json({
          uuid: v7UUID()
        });
        return
    }
    res.error('No valid version specified');
  }
}