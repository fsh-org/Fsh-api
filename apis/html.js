function pretty(text) {
  let u = String(text) || "";
  if (!u.includes("\n")) {
    return String(u)
      .replaceAll("><", ">\n<")
      .replaceAll("{", "{\n")
      .replaceAll("}", "\n}")
      .replaceAll("\n\n", "");
  } else {
    return u;
  }
}

module.exports = {
  path: "/html",
  info: "Gets the html of a url (use www. for better results) (linkback for relative to full paths)",
  type: "get",
  params: [
    {
      name: 'url',
      required: true,
      default: 'fsh.plus'
    },
    {
      name: 'linkback',
      required: false,
      default: 'false'
    }
  ],
  category: "text",
  
  async execute(req, res) {
    let uri = req.query["url"];
    if (!uri) {
      res.error('You must provide an url')
      return;
    }
    if (!uri.includes('://')) {
      uri = 'https://'+uri
    }
    try {
      let request = await fetch(uri, {
        follow: 20,
        redirect: "follow",
        headers: {
          "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 FshApi/1.0 (User, ${req.clientIp})`,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en;q=1.0",
          "sec-ch-ua": '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "sec-gpc": "1",
        }
      });

      if (request.headers.get("Content-Type").includes("text/html")) {
        res.header("Content-Type", "text/plain");
      } else {
        res.header("Content-Type", request.headers.get("Content-Type"));
      }

      let html = await request.text();

      if (req.query['linkback']) {
        html = html
          .replaceAll(/srcset=".+?"/g, function(match) {
            return 'src="'+match.split('"')[1].split(', ').slice(-1)[0].split(',').slice(-1)[0].split(' ')[0]+'"';
          })
          .replaceAll(/(href|src)="(?!http:\/\/|https:\/\/).+?"/g, function(match) {
            return match.split('"')[0] + '"' + (new URL(match.split('"')[1], uri)) + '"';
          })
          .replaceAll('https://google.com/images','https://www.google.com/images')
      }

      res.send(html);
    } catch (err) {
      res.error('Could not get', 500);
    }
  }
};