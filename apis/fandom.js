module.exports = {
  path: '/fandom',
  info: 'Get the contents of a fandom wiki page',
  type: 'get',
  params: ["url", true, "discord", false],
  category: "text",
  
  async execute(req, res) {
    if (!req.query["url"]) {
      res.status(400)
      res.send('url query necesary<br>Add discord=true for discord formating')
      return;
    }
    if (!req.query["url"].includes("fandom.com")) {
      res.status(400)
      res.send("URL must be from fandom")
      return;
    }

    let Url = req.query['url'];
    if (!Url.includes("://")) Url = 'https://'+Url;

    let data = await fetch(Url);
    data = await data.text();
    
    if (data.includes("There is currently no text in this page.")||data.includes("ou can't always catc")||data.includes(`<title>Bad title |`)) {
      res.status(400)
      res.send("Page doesn't exist")
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
      data = data.split("\n").filter(e=>{return e.replaceAll(/ |	|\n/g, '').length}).join("\n")
      // Make prettier
      data = data.replaceAll("<p><br>", "<p>")
      data = data.replaceAll("<p><br />", "<p>")
      data = data.replaceAll("\n</p>", "</p>")
      data = data.replaceAll("<p>\n", "<p>")
      data = data.replaceAll("</p><p>", "</p>\n<p>")
      data = data.replaceAll("<p></p>\n", "")
      data = data.replaceAll(/href="\/wiki/g, 'href="'+Url.split("/wiki")[0]+'/wiki')
      data = data.replaceAll(/ title=".+?"/g, '')
      data = data.replaceAll("&lt;", "<")
      data = data.replaceAll("&gt;", ">")
      data = data.replaceAll("&amp;", "&")
      data = data.replaceAll("\n</th>", "</th>")
      data = data.replaceAll("\n</td>", "</td>")
      data = data.replaceAll("<i></i>", "")
      data = data.replaceAll(/<div.+?>[^¬]+?<\/div>/g, function(match){
        return match.replaceAll(/<div.+?>|<\/div>/g, '')
      })

      // Discord formatting?
      if (req.query["discord"] == "true") {
        data = data.replaceAll(/<a href=".+?">.+?<\/a>/g, function(match){
          if (match.split(">")[1].split('<')[0] == match.split('"')[1]) return match.split('"')[1];
          if (match.split(">")[1].split('<')[0] == "") return '';
          return '['+match.split(">")[1].split('<')[0]+']('+match.split('"')[1]+')'
        })
        data = data.replaceAll(/<ol.*?>[^¬]+?<\/ol>/g, function(match){return match.replaceAll(/<ol.*?>|<\/ol>/g, '').replaceAll(/<li>/g, '1. ').replaceAll('</li>', '')})
        data = data.replaceAll(/<i.*?>|<\/i>|<sup.*?>|<\/sup>|<abbr.*?>|<\/abbr>/g, "*")
        data = data.replaceAll(/<b.*?>|<\/b>|<em.*?>|<\/em>|<strong.*?>|<\/strong>/g, "**")
        data = data.replaceAll(/<kbd.*?>|<\/kbd>/g, "`")
        data = data.replaceAll('<ul>','')
        data = data.replaceAll(/<u.*?>|<\/u>/g, "__")
        data = data.replaceAll(/<s.*?>|<\/s>/g, "~~")
        data = data.replaceAll('\n<th','| <th')
        data = data.replaceAll(/<th.*?>|<\/th>/g, "**")
        data = data.replaceAll(/\n<td.*?>/g,'| ')
        data = data.replaceAll(/<td.*?>/g,'| ')
        data = data.replaceAll('</td>',' ')
        data = data.replaceAll(/<ul.*?>|<\/ul>/g, "")
        data = data.replaceAll(/<[a-zA-Z0-9]{1,4}> /g, function(match){return match.slice(0, match.length-2)})
        data = data.replaceAll(/<\/.{1,5}>/g, "")
        data = data.replaceAll(/<(p|code|img|tbody|tr|table).*?>/g, "")
        data = data.replaceAll(/<img.*?>/g, "")
        data = data.replaceAll('<br>', "\n")
        data = data.replaceAll(/<h.>/g, function(match){
          return new Array(Math.min(3, Number(match.replaceAll(/[a-zA-Z<> \-().,%:;_\n\/\[\]]/g,""))+1)).join("#")+" "
        })
        data = data.replaceAll(/<li.*?>/g, "* ")
        data = data.replaceAll("<dl><dd>", "  ")
      }

      // Remove non necesary new lines
      data = data.split("\n").filter(e=>{return e.replaceAll(/ |	|\n/g, '').length}).join("\n")
    } catch (err) {
      res.status(500)
      res.send("error formatting data")
      return;
    }

    if (data == "") {
      res.status(400)
      res.send("Empty page")
      return;
    }

    res.status(200)
    res.set('Content-Type', 'text/plain');
    res.send(data)
  }
}