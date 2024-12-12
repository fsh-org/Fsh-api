const whois = require('whois');

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
  category: "text",

  async execute(req, res) {
    if (!req.query['url']) {
      res.error('Include url')
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
      whois.lookup(url, { timeout: 1000, verbose: true }, function(err, data) {
        if (!data[0]) {
          res.error('Could not get data from whois server')
          return;
        }
        data = data[0].data;
        if (data.startsWith('%')) {
          res.error('Could not get data')
          return;
        }
        function get(i) {
          let e = data.match(new RegExp(i+'\\: .*'));
          e = e ? e[0].replace('REDACTED FOR PRIVACY','No Data') : ': No Data';
          return e.split(': ')[1];
        }
        function getMultiple(i) {
          return data.match(new RegExp(i+'\\: .*', 'g')).map(e=>e.split(': ')[1]) || ['No Data'];
        }
        res.json({
          domain: get('Domain (N|n)ame'),
          id: get('Registry Domain ID'),
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
          expires: get('(Registrar Registration Expiration Date|Registry Expiry Date)'),
          updated: get('Updated Date'),
          created: get('Creation Date'),
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
          dnssec: get('DNSSEC'),
          status: getMultiple('Domain Status'),
          ns: getMultiple('Name Server')
        })
      })
    } catch (err) {
      res.error('Could not get data')
    }
  }
}