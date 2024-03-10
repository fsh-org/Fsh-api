const SamJs = require('sam-js');

let sam = new SamJs();

let text2Uint8Array = text => {
  let buffer = new Uint8Array(text.length);
  text.split('').forEach((e, index) => {
    buffer[index] = e.charCodeAt(0);
  });
  return buffer;
};
let Uint32ToUint8Array = uint32 => {
  let result = new Uint8Array(4);
  result[0] = uint32;
  result[1] = uint32 >> 8;
  result[2] = uint32 >> 16;
  result[3] = uint32 >> 24;
  return result;
};
let Uint16ToUint8Array = uint16 => {
  let result = new Uint8Array(2);
  result[0] = uint16;
  result[1] = uint16 >> 8;
  return result;
};

module.exports = {
  path: '/sam',
  info: 'Make SAM say anything',
  type: 'get',
  params: ['text', true],
  category: "audio",

  async execute(req, res) {
    let text = req.query['text'];
    if ((text || '').length < 1) {
      res.json({
        err: true,
        msg: 'You must include text'
      })
      return;
    }
    
    const audiobuffer = sam.buf8(text);

    let realbuffer = new Uint8Array(44 + audiobuffer.length);
    let pos = 0;

    let write;
    try {
      write = buffer => {
        realbuffer.set(buffer, pos);
        pos += buffer.length;
      };
    } catch (err) {
      res.json({
        err: true,
        msg: 'Could not convert'
      })
      return;
    }

    write(text2Uint8Array('RIFF'));
    write(Uint32ToUint8Array(audiobuffer.length + 28));
    write(text2Uint8Array('WAVE'));
    write(text2Uint8Array('fmt '));
    write(Uint32ToUint8Array(16));
    write(Uint16ToUint8Array(1));
    write(Uint16ToUint8Array(1));
    write(Uint32ToUint8Array(22050));
    write(Uint32ToUint8Array(22050));
    write(Uint16ToUint8Array(1));
    write(Uint16ToUint8Array(8));
    write(text2Uint8Array('data'));
    write(Uint32ToUint8Array(audiobuffer.length));
    write(audiobuffer);

    res.json({
      audio: `data:audio/wav;base64,${Buffer.from(realbuffer).toString('base64')}`
    });
  }
}