const sharp = require('sharp')

const size = 300;

module.exports = {
  path: '/join',
  info: 'Join two image urls together',
  type: 'get',
  params: ["one", true, "two", true],
  category: "image",

  async execute(req, res) {
    let one = req.query['one']
    let two = req.query['two']

    if (!one || !two) {
      res.json({
        err: true,
        msg: 'You must include both "one" and "two" parameters'
      })
      return;
    }

    try {
      one = await fetch(one);
      if (!String(one.status).startsWith(2)) {
        res.json({
          err: true,
          msg: 'Could not get images'
        })
        return;
      }
      one = await one.arrayBuffer();
      one = Buffer.from(one);

      two = await fetch(two);
      if (!String(two.status).startsWith(2)) {
        res.json({
          err: true,
          msg: 'Could not get images'
        })
        return;
      }
      two = await two.arrayBuffer();
      two = Buffer.from(two);
    } catch (err) {
      res.json({
        err: true,
        msg: 'Could not get images'
      })
      return;
    }

    let i1 = await sharp(one)
      .resize(size, size)
      .toBuffer()
    let i2 = await sharp(two)
      .resize(size, size)
      .toBuffer()

    sharp({
      create: {
        width: (size*2)+5,
        height: size,
        channels: 4,
        background: '#000'
      }
    })
      .composite([
        {input: i1, gravity: 'west'},
        {input: i2, gravity: 'east'}
      ])
      .jpeg()
      .toBuffer()
      .then(outputBuffer => {
        res.json({
          image: 'data:image/png;base64,' + outputBuffer.toString('base64')
        })
      })
      .catch(err => {
        res.json({
          err: true,
          msg: 'Could not generate'
        })
        return;
      })
  }
}