module.exports = {
  path: '/unit',
  info: 'Converts number to a abreviation of it (up to Quadragintillion)',
  type: 'get',
  params: ["number", true],
  category: "text",
  execute(req, res){
    if ((req.query["number"] || 0).length < 4) {
      res.send(`{"number": "${req.query["number"] || 0}", "short": "", "long": ""}`)
      return;
    }
    let abr = "K,M,B,t,q,Q,s,S,o,n,d,U,D,td,Qt,Qd,Sd,St,O,N,v,Uv,Dv,Tv,qv,Qv,sv,Sv,Ov,Nv,T,Ut,Dt,Tt,qt,Qt,st,St,Ot,Nt,QQ".split(",");
    let abl = "Kilo,Million,Billion,Trillion,Quadrillion,Quintillion,Sextillion,Septillion,Octillion,Nonillion,Decillion,Undecillion,Duodecillion,Tredecillion,Quattuordecillion,Quindecillion,Sexdecillion	,Septendecillion,Octodecillion,Novemdecillion,Vigintillion,Unvigintillion,Duovigintillion,Trevigintillion,Quattuorvigintillion,Quinvigintillion,Sexvigintillion,Septenvigintillion,Octovigintillion,Nonvigintillion,Trigintillion,Untrigintillion,Duotrigintillion,Trestrigintillion,Quattuortrigintillion,Quintrigintillion,Sestrigintillion,Septentrigintillion,Octotrigintillion,Noventrigintillion,Quadragintillion".split(",");
    let f = req.query["number"] || 0
    let h = Math.floor((f.length-1) / 3)
    h = Math.min(h, abr.length)
    //f = Math.floor(f / (10**((h*3)-2))) / 100
    //f = BigInt(Number(String(f).slice(0, f.length-(h*3-2)))/100)
    f = String(f).slice(0, f.length-(h*3)) + '.' + String(f).slice(f.length-(h*3), f.length-(h*3-2))
    res.send(`{"number": "${f}", "short": "${abr[h-1]}", "long": "${abl[h-1]}"}`)
  }
}