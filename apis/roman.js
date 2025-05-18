function lownumberToRoman(num) {
  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" }
  ];

  let roman = "";
  for (let i = 0; i < romanNumerals.length; i++) {
    while (num >= romanNumerals[i].value) {
      roman += romanNumerals[i].numeral;
      num -= romanNumerals[i].value;
    }
  }
  return roman;
}

function numberToRoman(num) {
  let  boxvinculum = '';
  if (num >= 100000) {
    boxvinculum = Math.floor(num/100000);
    num -= boxvinculum*100000;
    boxvinculum = '▕'+lownumberToRoman(boxvinculum).split('').join('\u0305')+'\u0305▏ ';
  }
  let vinculum = '';
  if (num >= 4000) {
    vinculum = Math.floor(num/1000);
    num -= vinculum*1000;
    vinculum = lownumberToRoman(vinculum).split('').join('\u0305')+'\u0305 ';
  }
  let roman = lownumberToRoman(num);

  return (boxvinculum + vinculum + roman).trim();
}

function lowromanToNumber(roman) {
  const romanNumerals = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
  };

  let result = 0;
  roman = roman.toUpperCase();
  for (let i = 0; i < roman.length; i++) {
    if (romanNumerals[roman[i]] < romanNumerals[roman[i + 1]]) {
      result -= romanNumerals[roman[i]];
    } else {
      result += romanNumerals[roman[i]];
    }
  }
  return result;
}
function romanToNumber(roman) {
  let boxvinculum = lowromanToNumber((roman.match(/▕(?:[IVXLCDM]\u0305)+▏/)??[''])[0].replaceAll(/▕|▏|\u0305/g,''))*100000;
  roman = roman.replace(/▕(?:[IVXLCDM]\u0305)+▏/, '').trim();
  let vinculum = lowromanToNumber((roman.match(/(?:[IVXLCDM]\u0305)+/)??[''])[0].replaceAll('\u0305',''))*1000;
  roman = roman.replace(/(?:[IVXLCDM]\u0305)+/, '').trim();
  let res = lowromanToNumber(roman);
  return (boxvinculum??0) + (vinculum??0) + (res??0);
}

module.exports = {
  path: '/roman',
  info: 'Encode and decode roman numerals (set type to encode/dedcode)',
  type: 'get',
  params: [
    {
      name: 'type',
      required: true,
      default: 'encode'
    },
    {
      name: 'number',
      required: true,
      default: '42'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (!req.query["type"]) {
      res.error('No conversion type recived');
      return;
    }
    if (!req.query["number"]) {
      res.error('No input recived');
      return;
    }
    if (req.query["type"] === "encode") {
      if (Number(req.query["number"])>999999999) {
        res.error('Number too large');
        return;
      }
      res.json({
        result: numberToRoman(Number(req.query["number"]))
      });
      return;
    }
    if (req.query["type"] === "decode") {
      res.json({
        result: romanToNumber(req.query["number"])
      });
      return;
    }
    res.error('Type not valid');
  }
}