const https = require("https");

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
  info: "Gets the html of a url (use www. for better results) (set linkback to true for relative paths to become full)",
  type: "get",
  params: ["url", true, "linkback", false],
  category: "text",
  
  async execute(req, res) {
    let uri = req.query["url"];
    if (uri == null) {
      res.error('Url not provided')
      return;
    } // thx for doing it, im too stupid; no me; you are the one who did it, you smart;
    if (!uri.includes('://')) {
      uri = 'https://'+uri
    }
    try {
      let request = await fetch(uri, {
        follow: 20,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Fsh (Api - user: " + req.clientIp + ")",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en;q=1.0",
          "sec-ch-ua": '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
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
            if (match.startsWith('//')) {
              return match.replace('"', '"https:');
            }
            let url = (req.query['url'].split('?')[0] + '/');
            if (match.includes('="/')) {
              return match
                .replace('"', '"'+url)
                .replace('://','||')
                .replace('//','/')
                .replace('||','://');
            }
  
            return match
              .replace('"', '"'+url)
              .replace(/(?<!\/|\/\/|:)\/.+?\/\.\//, '/')
              .replace('/./', '/')
              .replace(/(?!\/)\/.+?\/\..\//, '/')
          })
      }
      
      res.send(html);
    } catch (err) {
      res.error('Could not get', 500);
    }
  }
};