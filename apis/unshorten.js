const https = require('https');
const http = require('http');

async function unshorten(url) {
  if (url.startsWith('https://link.fsh.plus/')) {
    return new Promise((resolve, reject) => {
      try {
        (async () => {
          let h = await fetch('https://link.fsh.plus/get/'+url.split('/')[3])
          h = await h.json();
          resolve(h.link)
        })()
      } catch (err) {
        reject(err);
      }
    });
  }
  return new Promise((resolve, reject) => {
    try {
      const tracer = (urls, protocol = https) => {
        if (urls.slice(0, 5) === 'http:') {
          protocol = http;
        }

        protocol
          .get(urls, {}, ({ statusCode, headers: { location }, socket: {_host: host} }) => {
            if ([301, 302, 303, 307, 308].includes(statusCode)) {
              if (location) {
                if (location.startsWith('/')) {
                  location = `https://${host}${location}`;
                }

                tracer(location);
                return;
              }
            }
            resolve(urls);
          })
          .on('error', (err) => reject(err));
      };

      tracer(url);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  path: '/unshorten',
  info: 'Unshorten shortened URL\'s',
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
    if(!req.query['url']) {
      res.error('No url provided: ?url=')
      return;
    }
    let url = req.query.url;
    if(!/https:\/\/|http:\/\//g.test(url)){
      url = `https://${url}`;
    }
    try {
      let unshort = await unshorten(url)
      res.json({
        url: unshort
      })
    } catch (err) {
      res.error('Could not unshorten')
    }
  }
}