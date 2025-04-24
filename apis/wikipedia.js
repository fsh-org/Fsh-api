const wtf = require('wtf_wikipedia');
wtf.extend(require('wtf-plugin-markdown'));
wtf.extend(require('wtf-plugin-html'));

module.exports = {
  path: '/wikipedia',
  info: 'Get the text content of a wikipedia page',
  type: 'get',
  params: [
    {
      name: 'page',
      required: true,
      default: 'earth'
    },
    {
      name: 'html',
      required: false,
      default: 'false'
    }
  ],
  category: "text",

  async execute(req, res) {
    if (!req.query['page']) {
      res.error('Include a page');
      return;
    }

    let doc = await wtf.fetch(req.query['page'], {
      lang: 'en',
      'Api-User-Agent': `FshApi/1.0 (User, ${req.clientIp})`
    })

    let data = '';
    if (req.query['html']?.toLowerCase()==='true') {
      data = doc.html({ infoboxes: false });
      data = data
        .replaceAll(/>[ |\t|\n]{2,}</g, '><') // Clean up whitespace
        .replaceAll(/<a class="link" href="(.*?)">/g, function(_match, g1){return `<a class="link" href="${new URL(g1, doc.url())}">`}); // Link urls
    } else {
      data = doc.markdown({ infoboxes: false });
      // Link urls
      data = data.replaceAll(/(?:__|[*#])|\[(.*?)\]\(.*?\)/g, function(match){return match.replace(/\((.*?)\)/, function(_match, g1){return `(${new URL(g1, doc.url())})`})});
    }

    res.json({
      title: doc.title(),
      lang: doc.lang(),
      description: doc.description(),
      img: doc.images()[0].url(),
      data
    })
  }
}