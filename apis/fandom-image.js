module.exports = {
  path: '/fandom-image',
  info: 'Get the image of a fandom wiki page',
  type: 'get',
  params: [
    {
      name: 'url',
      required: true,
      default: 'wiki.fandom.com/wiki/page'
    }
  ],
  category: "image",
  
  async execute(req, res) {
    if (!req.query["url"]) {
      res.error('Url query necesary')
      return;
    }

    let Url = req.query['url'];
    if (!Url.includes("://")) Url = 'https://'+Url;

    if (!req.query["url"].match(/https\:\/\/[a-z0-9]+?\.fandom\.com/)) {
      res.error('URL must be from fandom')
      return;
    }

    let data = await fetch(Url);
    data = await data.text();
    
    if (data.includes("There is currently no text in this page.") || data.includes("ou can't always catc")) {
      res.error('Page doesn\'t exist')
      return;
    }

    if (data.includes("<p>Redirect to:</p>")) {
      res.error('Redirect to: '+Url.split("wiki/")[0]+'wiki/'+data.split('<ul class="redirectText"><li><a href="/wiki/')[1].split('"')[0])
      return;
    }

    try {
      data = data.match(/(?:"image">|title="">)[^¬]*?<img.+?src=".+?>/g);
      if (!data) {
        res.error('No image')
        return;
      }
      data = data[0].split('src="')[1].split('"')[0]
      data = data.split('/revision')[0]
    } catch (err) {
      res.error("Error formatting data")
      return;
    }

    if (data == "") {
      res.error("No image")
      return;
    }

    res.json({
      image: data
    })
  }
}