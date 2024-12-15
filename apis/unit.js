const abbreviations = ",K,M,B,t,q,Q,s,S,o,n,d,U,D,td,Qt,Qd,Sd,St,O,N,v,Uv,Dv,Tv,qv,Qv,sv,Sv,Ov,Nv,T,Ut,Dt,Tt,qt,Qt,st,St,Ot,Nt,QQQ,Uq,Dq,Tq,qq,Qq,sq,Sq,Oq,Nq,qqq,UQ,DQ,TQ,qQ,QQ,sQ,SQ,OQ,NQ,sss,Us,Ds,Ts,qs,Qs,ss,Ss,Os,Ns,SSS,US,DS,TS,qS,QS,sS,SS,OS,NS,OO,UO,DO,TO,qO,QO,sO,SO,oO,NO,NN,UN,DN,TN,qN,QN,sN,SN,ON,nN,C".split(",");
const abb = ",Thousand,Million,Billion,Trillion,Quadrillion,Quintillion,Sextillion,Septillion,Octillion,Nonillion,Decillion,Undecillion,Duodecillion,Tredecillion,Quattuordecillion,Quindecillion,Sexdecillion,Septendecillion,Octodecillion,Novemdecillion,Vigintillion,Unvigintillion,Duovigintillion,Trevigintillion,Quattuorvigintillion,Quinvigintillion,Sexvigintillion,Septenvigintillion,Octovigintillion,Nonvigintillion,Trigintillion,Untrigintillion,Duotrigintillion,Trestrigintillion,Quattuortrigintillion,Quintrigintillion,Sestrigintillion,Septentrigintillion,Octotrigintillion,Noventrigintillion,Quadragintillion,Unquadragintillion,DuoquadragintillionTresquadragintillion,Quattuorquadragintillion,Quinquadragintillion,Sexquadragintillion,Septenquadragintillion,Octoquadragintillion,Novemquadragintillion,Quinquagintillion,Unquinquagintillion,Duoquinquagintillion,Tresquinquagintillion,Quattuorquinquagintillion,Quinquinquagintillion,Sexquinquagintillion,Septenquinquagintillion,Octoquinquagintillion,Novemquinquagintillion,Sexagintillion,Unsexagintillion,Duosexagintillion,Tressexagintillion,Quattuorsexagintillion,Quinsexagintillion,Sexsexagintillion,Septensexagintillion,Octosexagintillion,Novemsexagintillion,Septuagintillion,Unseptuagintillion,Duoseptuagintillion,Tresseptuagintillion,Quattuorseptuagintillion,QuinseptuagintillionSexseptuagintillion,Septenseptuagintillion,Octoseptuagintillion,Novemseptuagintillion,Octogintillion,Unoctogintillion,Duooctogintillion,Tresoctogintillion,Quattuoroctogintillion,Quinoctogintillion,Sexoctogintillion,Septenoctogintillion,Octooctogintillion,Novemoctogintillion,Nonagintillion,Unnonagintillion,Duononagintillion,Trenonagintillion,Quattuornonagintillion,Quinnonagintillion,Sexnonagintillion,Septennonagintillion,Octononagintillion,Novemnonagintillion,Centillion".split(",");

function abbreviateNumber(number, negative) {  
  const largestExp = abbreviations.length - 1;
  let re, short, long;

  if (number < 1000) {
    re = number.toFixed(2);
    long = "";
    short = "";
  } else {
    const exp = Math.min(largestExp, Math.floor(Math.log10(number) / 3));
    re = (number / Math.pow(10, exp * 3)).toFixed(2);
    long = abb[exp];
    short = abbreviations[exp];
  }

  if (re.endsWith(".00")) re = re.replace('.00','');
  if (re.match(/\.[0-9]0$/m)) re = re.split("").slice(0,re.split("").length-1).join("");

  return {
    number: `${negative ? "-" : ""}${re}`,
    short: short || "",
    long: long || "",
  };
}

module.exports = {
  path: '/unit',
  info: 'Converts number to a abreviation of it (up to Centillion)',
  type: 'get',
  params: [
    {
      name: 'number',
      required: true,
      default: '69420'
    }
  ],
  category: "text",

  async execute(req, res) {
    if ((req.query["number"] ?? 0).length < 4) {
      res.json({
        number: req.query["number"] ?? 0,
        short: "",
        long: ""
      })
      return;
    }
    let num = Number(String(req.query["number"]??0).replace(" ","+"))
    if (isNaN(num)) {
      res.error('Not a number')
    }
    let neg = num<0;
    num = Math.abs(num)
    let result = abbreviateNumber(num, neg, res)
    res.json(result)
  }
}