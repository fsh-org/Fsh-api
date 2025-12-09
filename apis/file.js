module.exports = {
  path: '/file',
  info: 'Get a file from a url',
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
    let uri = req.query['url'];
    if (!uri) {
      res.error('You must provide an url');
      return;
    }
    if (!uri.includes('://')) uri = 'https://'+uri;
    try {
      let request = await fetch(uri, {
        follow: 10,
        redirect: 'follow',
        method: req.method.toUpperCase()??'GET',
        headers: {
          'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 FshApi/1.0 (User, ${req.pip.replace('::ffff:','')??req.headers['cf-connecting-ip']??req.ip})`,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en;q=1.0',
          'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'sec-gpc': '1',
        }
      });

      res.header('content-type', request.headers.get('Content-Type')??'application/octet-stream');

      request = await request.arrayBuffer();
      res.send(Buffer.from(request));
    } catch (err) {
      res.error('Could not get', 500);
    }
  }
};