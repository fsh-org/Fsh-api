function abbreviateNumber(number, negative) {
  number = Number(number)
  
  if (isNaN(number)) {
    return {
      err: true,
      msg: "Not a number"
    }
  }
  
  const abbreviations = ",K,M,B,t,q,Q,s,S,o,n,d,U,D,td,Qt,Qd,Sd,St,O,N,v,Uv,Dv,Tv,qv,Qv,sv,Sv,Ov,Nv,T,Ut,Dt,Tt,qt,Qt,st,St,Ot,Nt,QQQ,Uq,Dq,Tq,qq,Qq,sq,Sq,Oq,Nq,qqq,UQ,DQ,TQ,qQ,QQ,sQ,SQ,OQ,NQ,sss,Us,Ds,Ts,qs,Qs,ss,Ss,Os,Ns,SSS,US,DS,TS,qS,QS,sS,SS,OS,NS,OO,UO,DO,TO,qO,QO,sO,SO,oO,NO,NN,UN,DN,TN,qN,QN,sN,SN,ON,nN,C".split(",");
  const abb = ",Thousand,Million,Billion,Trillion,Quadrillion,Quintillion,Sextillion,Septillion,Octillion,Nonillion,Decillion,Undecillion,Duodecillion,Tredecillion,Quattuordecillion,Quindecillion,Sexdecillion,Septendecillion,Octodecillion,Novemdecillion,Vigintillion,Unvigintillion,Duovigintillion,Trevigintillion,Quattuorvigintillion,Quinvigintillion,Sexvigintillion,Septenvigintillion,Octovigintillion,Nonvigintillion,Trigintillion,Untrigintillion,Duotrigintillion,Trestrigintillion,Quattuortrigintillion,Quintrigintillion,Sestrigintillion,Septentrigintillion,Octotrigintillion,Noventrigintillion,Quadragintillion,Unquadragintillion,DuoquadragintillionTresquadragintillion,Quattuorquadragintillion,Quinquadragintillion,Sexquadragintillion,Septenquadragintillion,Octoquadragintillion,Novemquadragintillion,Quinquagintillion,Unquinquagintillion,Duoquinquagintillion,Tresquinquagintillion,Quattuorquinquagintillion,Quinquinquagintillion,Sexquinquagintillion,Septenquinquagintillion,Octoquinquagintillion,Novemquinquagintillion,Sexagintillion,Unsexagintillion,Duosexagintillion,Tressexagintillion,Quattuorsexagintillion,Quinsexagintillion,Sexsexagintillion,Septensexagintillion,Octosexagintillion,Novemsexagintillion,Septuagintillion,Unseptuagintillion,Duoseptuagintillion,Tresseptuagintillion,Quattuorseptuagintillion,QuinseptuagintillionSexseptuagintillion,Septenseptuagintillion,Octoseptuagintillion,Novemseptuagintillion,Octogintillion,Unoctogintillion,Duooctogintillion,Tresoctogintillion,Quattuoroctogintillion,Quinoctogintillion,Sexoctogintillion,Septenoctogintillion,Octooctogintillion,Novemoctogintillion,Nonagintillion,Unnonagintillion,Duononagintillion,Trenonagintillion,Quattuornonagintillion,Quinnonagintillion,Sexnonagintillion,Septennonagintillion,Octononagintillion,Novemnonagintillion,Centillion".split(",");
  
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
  if (re.endsWith("0")) re = re.split("").slice(0,re.split("").length-1).join("");
  
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
  params: ["number", true],
  category: "text",
  execute(req, res){
    if ((req.query["number"] || 0).length < 4) {
      res.json({number: req.query["number"] || 0, short: "", long: ""})
      return;
    }
    /*let abr = "K,M,B,t,q,Q,s,S,o,n,d,U,D,td,Qt,Qd,Sd,St,O,N,v,Uv,Dv,Tv,qv,Qv,sv,Sv,Ov,Nv,T,Ut,Dt,Tt,qt,Qt,st,St,Ot,Nt,QQ".split(",");
    let abl = "Kilo,Million,Billion,Trillion,Quadrillion,Quintillion,Sextillion,Septillion,Octillion,Nonillion,Decillion,Undecillion,Duodecillion,Tredecillion,Quattuordecillion,Quindecillion,Sexdecillion,Septendecillion,Octodecillion,Novemdecillion,Vigintillion,Unvigintillion,Duovigintillion,Trevigintillion,Quattuorvigintillion,Quinvigintillion,Sexvigintillion,Septenvigintillion,Octovigintillion,Nonvigintillion,Trigintillion,Untrigintillion,Duotrigintillion,Trestrigintillion,Quattuortrigintillion,Quintrigintillion,Sestrigintillion,Septentrigintillion,Octotrigintillion,Noventrigintillion,Quadragintillion".split(",");
    let f = req.query["number"] || 0;
    let hj;
    if (f.includes(".") && !f.includes("e")) {
      f = f.split(".");
      hj = f[1].length;
      f = f.join("")
    }
    if (f.includes("e")) {
      f = Number(f.replace(" ","+")).toPrecision(Math.max(Math.min(Number(f.split(" ")[1])+1, 100) , 1));
      f = String(f)
    }
    let h = Math.floor((f.length-1) / 3)
    h = Math.min(h, abr.length)
    h = Math.max(h, 1)
    //f = Math.floor(f / (10**((h*3)-2))) / 100
    //f = BigInt(Number(String(f).slice(0, f.length-(h*3-2)))/100)
    f = String(f).slice(0, f.length-(h*3)) + '.' + String(f).slice(f.length-(h*3), f.length-(h*3-2))
    res.send(`{"number": "${f}", "short": "${abr[h-1] || ""}", "long": "${abl[h-1] || ""}"}`)*/
    let num = Number(String(req.query["number"]||0).replace(" ","+"))
    let neg = num<0;
    num = Math.abs(num)
    res.json(abbreviateNumber(num, neg))
  }
}