let cache;

module.exports = {
  path: '/color',
  info: 'Get info on a color (hex param without #), leave hex empty for random',
  type: 'get',
  params: [
    {
      name: 'hex',
      required: false,
      default: 'ff0000'
    }
  ],
  category: 'text',

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
    let hex = req.query['hex'];
    if (!hex) {
      var keys = Object.keys(cache);
      hex = keys[ keys.length * Math.random() << 0];
    } else if ([3,4].includes(hex.length)) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + (hex[3]??'') + (hex[3]??'')
    }
    res.json({
      hex: '#'+hex,
      name: cache[hex.slice(0,6)] ?? 'Unknown',
      preview: 'https://api.fsh.plus/colour?hex='+hex
    })
  }
}