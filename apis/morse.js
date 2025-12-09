const morseCodeMap = {
  'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '\'': '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};
const morseCodeMapReverse = {
  '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': '\'', '-.-.--': '!', '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&', '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-', '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@', '': ' '
};

function stringToMorse(input) {
 return input.split('').map(char => morseCodeMap[char] || char).join(' ');
}
function morseToString(morseCode) {
  return morseCode.split(' ').map(char => morseCodeMapReverse[char]).join('');
}

module.exports = {
  path: '/morse',
  info: 'Encode and decode morse and utf8 (set type to encode/dedcode)',
  type: 'get',
  params: [
    {
      name: 'type',
      required: true,
      default: 'encode'
    },
    {
      name: 'text',
      required: true,
      default: 'fshy'
    }
  ],
  category: 'text',

  async execute(req, res) {
    if (!req.query['type']) {
      res.error('No conversion type recived');
      return;
    }
    if (!req.query['text']) {
      res.error('No text recived');
      return;
    }
    if (req.query['type']==='encode') {
      res.json({
        text: stringToMorse(req.query['text'])
      });
      return;
    }
    if (req.query['type']==='decode') {
      res.json({
        text: morseToString(req.query['text'])
      });
      return;
    }
    res.error('Type not valid');
  }
}