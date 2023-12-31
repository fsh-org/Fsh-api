async function getIM(url) {
  let imgU = await fetch(url)
  imgU = await imgU.json();
  return imgU;
}

module.exports = {
  path: '/animal',
  info: 'Responds with a image of specified animal (empty for list)',
  type: 'get',
  params: ["animal", true],
  category: "image",
  async execute(req, res){
    // No option :(
    if (!req.query["animal"]) {
      let opt = ["Cat", "Dog", "Fox", "Duck", "Frog", "Bunny", "Shibe", "Fish", "Alpaca", "Bird"].sort();
      res.send(`Avaible animals:<br>- ${opt.join("<br>- ")}`);
      return;
    }
    // Yes option :)
    let img;
    switch (req.query["animal"]) {
      case 'cat':
        img = await getIM("https://api.thecatapi.com/v1/images/search")
        res.send(`{"image": "${img[0].url}"}`)
        break;
      case 'dog':
        img = await getIM("https://dog.ceo/api/breeds/image/random")
        res.send(`{"image": "${img.message.replaceAll('\\','')}"}`)
        break;
      case 'fox':
        img = await getIM("https://randomfox.ca/floof/")
        res.send(`{"image": "${img.image.replaceAll('\\','')}"}`)
        break;
      case 'duck':
        img = await getIM("https://random-d.uk/api/v1/random")
        res.send(`{"image": "${img.url}"}`)
        break;
      case 'frog':
        let uu = Math.floor(Math.random() * 54 + 1);
        if (uu.length == 1) {
          uu = "000" + uu
        } else {
          uu = "00" + uu
        }
        res.send(`{"image": "http://allaboutfrogs.org/funstuff/random/${uu}.jpg"}`)
        break;
      case 'bunny':
        img = await getIM("https://api.bunnies.io/v2/loop/random/?media=gif,png")
        res.send(`{"image": "${img.media[Math.random() > 0.3 ? "poster" : "gif"]}"}`)
        break;
      case 'shibe':
        img = await getIM("https://shibe.online/api/shibes")
        res.send(`{"image": "${img[0]}"}`)
        break;
      case 'fish':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/fish")
        res.send(`{"image": "${img.message}"}`)
        break;
      case 'alpaca':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/alpaca")
        res.send(`{"image": "${img.message}"}`)
        break;
      case 'bird':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/bird")
        res.send(`{"image": "${img.message}"}`)
        break;
      default:
        res.send('{"error": true, "msg": "invalid animal"}')
    }
  }
}