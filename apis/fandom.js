module.exports = {
  path: '/fandom',
  info: 'Get the contents of a fandom wiki page',
  type: 'get',
  params: [
    {
      name: 'url',
      required: true,
      default: 'wiki.fandom.com/wiki/page'
    },
    {
      name: 'discord',
      required: false,
      default: 'true'
    }
  ],
  category: "text",
  
  async execute(req, res) {
    if (!req.query["url"]) {
      res.type('text/html').send('url query necesary<br>Add discord=true for discord formating')
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
    
    if (data.includes("There is currently no text in this page.")||data.includes("ou can't always catc")||data.includes(`<title>Bad title |`)) {
      res.error("Page doesn't exist")
      return;
    }

    if (data.includes("<p>Redirect to:</p>")) {
      res.send('Redirect to: '+Url.split("wiki/")[0]+'wiki/'+data.split('<ul class="redirectText"><li><a href="/wiki/')[1].split('"')[0])
      return;
    }

    try {
      // Remove fandom trash
      data = data.split('<div class="mw-parser-output">')[1].split('<!--')[0]
      data = data.replaceAll(/<aside.+?>[^¬]+?<\/aside>/g, "")
      data = data.replaceAll(/<noscript.*?>[^¬]+?<\/noscript>/g, "")
      data = data.replaceAll(/<div id="toc".+?>[^¬]+?<\/ul>\n<\/div>/g, "")
      //data = data.split("</div>").slice(-1)[0]
      //data = data.replaceAll(/<!--[a-zA-Z0-9  \n\-‐_%.,:()!\[\]\/<>]+?-->/g, "")
      data = data.replaceAll(/<span.+?>|<\/span>|<figure.+?<\/figure>/g, "")
      data = data.replaceAll(/\[<a class=\"mw\-editsection-visualeditor\".+?<\/a>\]/g, "")
      data = data.replaceAll(' target="_blank" rel="nofollow noreferrer noopener"', '')
      data = data.replaceAll(/ class="external.+?"/g, '')
      // Remove non necesary new lines
      data = data.split("\n").filter(e=>{return e.replaceAll(/ |\t|\n/g, '').length}).join("\n")
      // Make prettier
      data = data.replaceAll("<p><br>", "<p>")
      data = data.replaceAll("<p><br />", "<p>")
      data = data.replaceAll("\n</p>", "</p>")
      data = data.replaceAll("<p>\n", "<p>")
      data = data.replaceAll("</p><p>", "</p>\n<p>")
      data = data.replaceAll("<p></p>\n", "")
      data = data.replaceAll(/href="\/wiki/g, 'href="'+Url.split("/wiki")[0]+'/wiki')
      data = data.replaceAll(/ title=".+?"/g, '')
      data = data
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&amp;", "&")
        .replaceAll('&#160;', ' ')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&#x3c;', '<')
        .replaceAll('&#x3e;', '>')
      data = data.replaceAll("\n</th>", "</th>")
      data = data.replaceAll("\n</td>", "</td>")
      data = data.replaceAll("<i></i>", "")
      data = data.replaceAll(/<tbody>|<\/tbody>/g, "")
      data = data.replaceAll("</center><center>", "</center>\n<center>")
      data = data.replaceAll(/<div.+?>[^¬]+?<\/div>/g, function(match){
        return match.replaceAll(/<div.+?>|<\/div>/g, '')
      })

      // Discord formatting?
      if (req.query["discord"] === "true") {
        data = data.replaceAll(/<a href=".+?">.+?<\/a>/g, function(match){
          if (match.split(">")[1].split('<')[0] == match.split('"')[1]) return match.split('"')[1];
          if (match.split(">")[1].split('<')[0] == "") return '';
          return '['+match.split(">")[1].split('<')[0]+']('+match.split('"')[1]+')'
        })
        data = data.replaceAll(/<ol.*?>[^¬]+?<\/ol>/g, function(match){return match.replaceAll(/<ol.*?>|<\/ol>/g, '').replaceAll(/<li>/g, '1. ').replaceAll('</li>', '')})
        data = data.replaceAll(/<i.*?>|<\/i>|<sup.*?>|<\/sup>|<abbr.*?>|<\/abbr>/g, "*")
        data = data.replaceAll(/<b.*?>|<\/b>|<em.*?>|<\/em>|<strong.*?>|<\/strong>/g, "**")
        data = data.replaceAll(/<kbd.*?>|<\/kbd>/g, "`")
        data = data.replaceAll(/<li>[^¬]*?<ul>[^¬]*?<\/ul><\/li>/g, function(match){
          match = match.split('ul>')
          match[1] = match[1].replaceAll('<li>', '  - ')
          match = match.join('ul>')
          return match
        })
        data = data.replaceAll(/<li.*?>/g, "- ")
        data = data.replaceAll(/<ul.*?>|<\/ul>/g, "")
        data = data.replaceAll(/<u.*?>|<\/u>/g, "__")
        data = data.replaceAll(/<s.*?>|<\/s>/g, "~~")
        data = data.replaceAll('\n<th','| <th')
        data = data.replaceAll(/<th.*?>|<\/th>/g, "**")
        data = data.replaceAll(/\n<td.*?>/g,'| ')
        data = data.replaceAll(/<td.*?>/g,'| ')
        data = data.replaceAll('</td>',' ')
        data = data.replaceAll(/<code>|<\/code>/g, '`')
        data = data.replaceAll(/<[a-zA-Z0-9]{1,4}> /g, function(match){return match.slice(0, match.length-2)})
        data = data.replaceAll(/<\/.{1,5}>/g, "")
        data = data.replaceAll(/<.{0,1}(p|code|img|tbody|tr|table|center).*?>/g, "")
        data = data.replaceAll('<br>', "\n")
        data = data.replaceAll(/<h.>/g, function(match){
          return new Array(Math.min(3, Number(match.replaceAll(/[a-zA-Z<> \-().,%:;_\n\/\[\]]/g,""))+1)).join("#")+" "
        })
        data = data.replaceAll("<dl><dd>", "  ")
      }

      // Remove non necesary new lines
      data = data.split("\n").filter(e=>{return e.replaceAll(/ |\t|\n/g, '').length}).join("\n")
    } catch (err) {
      res.error('Error formatting data', 500)
      return;
    }

    if (data == "") {
      res.status(400)
      res.send("Empty page")
      return;
    }

    res.type('text/plain').send(data)
  }
}