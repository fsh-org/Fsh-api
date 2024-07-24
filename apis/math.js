const Mexp = require("math-expression-evaluator");

module.exports = {
  path: '/math',
  info: 'Evaluate a math expression',
  type: 'get',
  params: ["line", true],
  category: "text",

  async execute(req, res) {
    const mexp = new Mexp()

    let rs;
    try {
      rs = String(mexp.eval(req.url.split('line=')[1].split('&')[0].replaceAll('%20','').replaceAll('**','^')));
    } catch (err) {
      rs = 'invalid expression'
    }

    res.json({
      result: rs
    })
  }
}