const fs = require('node:fs');

let slurtxt = fs.readFileSync('text/slur.txt', 'utf8').split(',').sort((f,s)=>s.length-f.length);
let sweartxt = fs.readFileSync('text/swear.txt', 'utf8').split(',').sort((f,s)=>s.length-f.length);
let adulttxt = fs.readFileSync('text/adult.txt', 'utf8').split(',').sort((f,s)=>s.length-f.length);

function bad(text, words, sie) {
  let copy = text
  for (let w in words) {
    let t = new Array(words[w].length + 1).join(sie);
    let reg = new RegExp(words[w], 'ig')
    copy = copy.replaceAll(reg, t)
  }
  return [text != copy, text == copy ? text : copy];
}

module.exports = {
  path: '/filter',
  info: 'Tells if sentence has bad words and censors them',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'Hello'
    },
    {
      name: 'char',
      required: false,
      default: '#'
    },
    {
      name: 'category',
      required: false,
      default: 'adult,swear,slur'
    }
  ],
  category: 'text',

  async execute(req, res) {
    let response;
    if (req.method == 'POST') {
      response = req.body.text;
    } else {
      response = req.query['text'];
    }
    if (!response) {
      res.json({
        bad: false,
        swear: false,
        slur: false,
        adult: false,
        censor: ''
      })
      return;
    }
    const sie = req.query['char'] ?? '#';
    const cat = req.query['category'] ?? 'adult,swear,slur';

    let hh;
    let tt = [];

    hh = bad(response, sweartxt, sie);
    if (cat.includes('swear')) {
      response = hh[1];
    }
    tt.push(hh[0]);

    hh = bad(response, slurtxt, sie);
    if (cat.includes('slur')) {
      response = hh[1];
    }
    tt.push(hh[0]);

    hh = bad(response, adulttxt, sie);
    if (cat.includes('adult')) {
      response = hh[1];
    }
    tt.push(hh[0]);

    res.json({
      bad: String(tt[0] || tt[1] || tt[2]),
      swear: String(tt[0]),
      slur: String(tt[1]),
      adult: String(tt[2]),
      censor: response
    })
  }
}