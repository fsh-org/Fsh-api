const whois = require('whois');

function unique(array) {
  // Faster than [...new Set(array)] or Array.from(new Set(array)) aparently
  const seen = new Set();
  const out = [];
  for (let i = 0; i < array.length; i++) {
    if (!seen.has(array[i])) {
      seen.add(array[i]);
      out.push(array[i]);
    }
  }
  return out;
}

module.exports = {
  path: '/whois',
  info: 'Get whois info on a domain',
  type: 'get',
  params: [
    {
      name: 'url',
      required: true,
      default: 'fsh.plus'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['url']) {
      res.error('Include url');
      return;
    }
    let url = req.query['url'];
    url = url
      .split('://')
      .slice(-1)[0]
      .split('/')[0]
      .split('.')
      .slice(-2)
      .join('.');
    try {
      whois.lookup(url, { timeout: 2000, verbose: true }, function(err, data) {
        if (!data) {
          res.error('Could not get data from whois server');
          return;
        }
        if (!data[0]) {
          res.error('Could not get data from whois server');
          return;
        }
        data = data.map(d=>d.data
          .replaceAll('\r\n','\n')
          .replaceAll(/\t+/g,' ')
          .replace(/\>\>\>([^¬]|¬)+/,'')
          .split('\n')
          .map(l=>l.replace('REDACTED FOR PRIVACY','').replace('DATA REDACTED','').trim().replace(/^[a-zA-Z ]+?:$/m,''))
          .filter(l=>!l.startsWith('%')&&l.length>0));
        data.sort((a,b)=>b.length-a.length);
        data = data.flat().join('\n').trim();
        function get(i) {
          let e = data.match(new RegExp(`^(${i}): .*$`, 'mi'));
          if (!e) e = [':'];
          e = e[0];
          return e.split(':').slice(1).join(':').trim();
        }
        function getMultiple(i) {
          return Array.from(new Set(data.match(new RegExp(`^(${i}): .*$`, 'gmi'))?.map(e=>e.split(':').slice(1).join(':').trim()).filter(e=>e.length) ?? []));
        }
        res.json({
          domain: get('Domain Name|domain|ascii'),
          id: get('Registry Domain ID'),
          expires: get('Registrar Registration Expiration Date|Registry Expiry Date|Expiration Date'),
          updated: get('Updated Date|Modification Date'),
          created: get('Creation Date|Registration Date'),
          registrar: {
            name: get('Registrar'),
            id: get('Registrar IANA ID'),
            url: get('Registrar URL'),
            server: get('Registrar WHOIS Server'),
            abuse: {
              email: get('Registrar Abuse Contact Email'),
              phone: get('Registrar Abuse Contact Phone')
            }
          },
          registrant: {
            name: get('Registrant Name'),
            id: get('Registry Registrant ID'),
            org: get('Registrant Organization'),
            country: get('Registrant Country'),
            state: get('Registrant State/Province'),
            street: get('Registrant Street'),
            city: get('Registrant City'),
            postal: get('Registrant Postal Code'),
            email: get('Registrant Email'),
            phone: get('Registrant Phone'),
            phone_ext: get('Registrant Phone Ext'),
            fax: get('Registrant Fax'),
            fax_ext: get('Registrant Fax Ext')
          },
          admin: {
            name: get('Admin Name'),
            id: get('Registry Admin ID'),
            org: get('Admin Organization'),
            country: get('Admin Country'),
            state: get('Admin State/Province'),
            street: get('Admin Street'),
            city: get('Admin City'),
            postal: get('Admin Postal Code'),
            email: get('Admin Email'),
            phone: get('Admin Phone'),
            phone_ext: get('Admin Phone Ext'),
            fax: get('Admin Fax'),
            fax_ext: get('Admin Fax Ext')
          },
          tech: {
            name: get('Tech Name'),
            id: get('Registry Tech ID'),
            org: get('Tech Organization'),
            country: get('Tech Country'),
            state: get('Tech State/Province'),
            street: get('Tech Street'),
            city: get('Tech City'),
            postal: get('Tech Postal Code'),
            email: get('Tech Email'),
            phone: get('Tech Phone'),
            phone_ext: get('Tech Phone Ext'),
            fax: get('Tech Fax'),
            fax_ext: get('Tech Fax Ext')
          },
          dnssec: get('DNSSEC( signed)?'),
          status: getMultiple('Domain Status'),
          ns: unique(getMultiple('Name Server|DNS|nserver').map(ns=>ns.toLowerCase()))
        })
      })
    } catch (err) {
      res.error('Could not get data');
    }
  }
}