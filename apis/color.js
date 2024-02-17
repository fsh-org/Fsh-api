let cache;

module.exports = {
  path: '/color',
  info: 'Get info on a color (hex param without #)',
  type: 'get',
  params: ["hex", true],
  category: "text",

  async execute(req, res) {
    if (!cache) {
      let dat = await fetch('https://unpkg.com/color-name-list@10.19.0/dist/colornames.min.json', {
        headers: {
          'user-agent': 'api.fsh.plus (if problem contact help@fsh.plus)'
        }
      })
      dat = await dat.json();
      cache = dat
    }
    let hex = req.query['hex'] || '#f00';
    res.json({
      hex: '#'+hex,
      name: cache[hex] || 'Unknown',
      preview: 'https://api.fsh.plus/colour?hex='+hex
    })
  }
}