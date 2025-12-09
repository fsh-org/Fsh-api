function getr(data, reg) {
  try {
    return data.match(reg)[0] || '';
  } catch(err) {
    return ''
  }
}

module.exports = {
  path: '/site',
  info: 'Get meta title, description and favicon of a website',
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
    if (!req.query.url) {
      res.error('Provide a url');
      return;
    }
    let url = req.query.url;
    if (!url.includes('://')) url = 'https://'+url;
    let data;
    try {
      data = await fetch(url, {
        headers:{
          'user-agent': 'Mozilla 5.0 (Windows) Fsh (Api - user: '+req.clientIp+')',
          'accept-language': 'en;q=1.0'
        }
      });
    } catch (err) {
      res.error('Could not get', 500);
      return;
    }
    data = await data.text();
    res.json({
      title: getr(data, /<title>.*?<\/title>/).replace(/<title>|<\/title>/g,'') ?? '',
      description: getr(getr(data, /<meta[^<>]+?name="description".+?content=".*?".*?>/), /content=".*?"/).replace(/content="|"/g, '') ?? '',
      favicon: new URL(getr(getr(data, /<link[^<>]+?rel="(?:icon|shortcut icon)".+?href=".*?".*?>/), /href=".*?"/).replace(/href="|"/g, '') ?? '', url)
    })
  }
}