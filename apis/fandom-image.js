function err(res, message) {
  res.status(400)
  res.json({
    err: true,
    msg: message
  })
}

module.exports = {
  path: '/fandom-image',
  info: 'Get the image of a fandom wiki page',
  type: 'get',
  params: ["url", true],
  category: "hidden",
  
  async execute(req, res) {
    if (!req.query["url"]) {
      err(res,"url query necesary")
      return;
    }
    if (!req.query["url"].includes("fandom.com")) {
      err(res,"URL must be from fandom")
      return;
    }

    let Url = req.query['url'];
    if (!Url.includes("://")) Url = 'https://'+Url;

    let data = await fetch(Url);
    data = await data.text();
    
    if (data.includes("There is currently no text in this page.")||data.includes("ou can't always catc")) {
      err(res,"Page doesn't exist")
      return;
    }

    if (data.includes("<p>Redirect to:</p>")) {
      err(res,'Redirect to: '+Url.split("wiki/")[0]+'wiki/'+data.split('<ul class="redirectText"><li><a href="/wiki/')[1].split('"')[0])
      return;
    }

    try {
      data = data.match(/(?:"image">|title="">)[^¬]*?<img.+?src=".+?>/g);
      if (!data) {err(res, 'No image');return;}
      data = data[0].split('src="')[1].split('"')[0]
      data = data.split('/revision')[0]
    } catch (err) {
      err(res,"error formatting data")
      return;
    }

    if (data == "") {
      err(res,"No image")
      return;
    }

    res.status(200)
    res.json({
      image: data
    })
  }
}