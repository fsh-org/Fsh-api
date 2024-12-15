async function getIM(url) {
  let imgU = await fetch(url)
  imgU = await imgU.json();
  return imgU;
}

module.exports = {
  path: '/animal',
  info: 'Responds with a image of specified animal (empty for list)',
  type: 'get',
  params: [
    {
      name: 'animal',
      required: true,
      default: 'cat'
    }
  ],
  category: "image",

  async execute(req, res) {
    // No option :(
    if (!req.query["animal"]) {
      let opt = ["Cat", "Dog", "Fox", "Duck", "Frog", "Bunny", "Fish", "Alpaca", "Bird"].sort();
      res.type('text/html').send(`Avaible animals:<br>- ${opt.join("<br>- ")}`);
      return;
    }
    // Yes option :)
    let img;
    switch (req.query["animal"]) {
      case 'cat':
        img = await getIM("https://api.thecatapi.com/v1/images/search")
        res.json({
          image: img[0].url
        })
        break;
      case 'dog':
        img = await getIM("https://dog.ceo/api/breeds/image/random")
        res.json({
          image: img.message.replaceAll('\\','')
        })
        break;
      case 'fox':
        img = await getIM("https://randomfox.ca/floof/")
        res.json({
          image: img.image.replaceAll('\\','')
        })
        break;
      case 'duck':
        img = await getIM("https://random-d.uk/api/v1/random")
        res.json({
          image: img.url
        })
        break;
      case 'frog':
        res.json({
          image: `http://allaboutfrogs.org/funstuff/random/${String(Math.floor(Math.random() * 54 + 1)).padStart(4, '0')}.jpg`
        })
        break;
      case 'bunny':
        img = await getIM("https://api.bunnies.io/v2/loop/random/?media=gif,png")
        res.json({
          image: img.media[Math.random() > 0.3 ? "poster" : "gif"]
        })
        break;
      case 'fish':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/fish")
        res.json({
          image: img.message
        })
        break;
      case 'alpaca':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/alpaca")
        res.json({
          image: img.message
        })
        break;
      case 'bird':
        img = await getIM("https://api.sefinek.net/api/v2/random/animal/bird")
        res.json({
          image: img.message
        })
        break;
      default:
        res.error('Invalid animal')
    }
  }
}