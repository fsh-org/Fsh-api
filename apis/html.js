const https = require("https")

function pretty(text) {
  let u = String(text) || ""
  if (!u.includes("\n")) {
    return String(u).replaceAll("><", ">\n<").replaceAll("{","{\n").replaceAll("}","\n}").replaceAll("\n\n","");
  } else {
    return u;
  }
}

module.exports = {
  path: '/html',
  info: 'Gets the html of a url (use www. for better results)',
  type: 'get',
  params: ["url", true],
  category: "text",
  execute(req, res){
    if (req.query["url"] == null) {
      res.status(400)
      res.send('{"status": 400, "err": true}')
      return;
    }; // thx for doing it, im too stupid; no me; you are the one who did it, you smart;
		(async()=>{
			try{
			let request = await fetch(req.query["url"], {
			follow: 20,
      redirect: "follow",
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',// windows :thumbsup:
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en;q=1.0,es;q=0.9,ru;q=0.8,he;q=0.7',
        'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
			}// did request to twitter and putting random headers google sent
		});
				res.status(200)
        if (request.headers.get("Content-Type").includes("text/html")) {
          res.header("Content-Type", "text/plain")
        } else {
          res.header("Content-Type", request.headers.get("Content-Type"))
        }
        res.send(await request.text())
			} catch(err) {
				res.status(500)
        res.send('{"status": 500, "err": true}')
			}
		})();
    /*fetch(req.query["url"], {
			headers: {
				'User-Agent': 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
			}
		})
      .then(async (response) => {
        res.status(200)
        res.header("Content-Type", 'text/plain')
        res.send(await response.text())
      })
      .catch(async (err) => {
        res.status(500)
        res.send('{"status": 500, "err": true}')
      });*/
  }
}