module.exports = {
  path: '/wikipedia',
  info: 'Get the text content of a wikipedia page',
  type: 'get',
  params: ['page', true],
  category: "text",

  async execute(req, res) {
    let ser = await fetch(`https://api.wikimedia.org/core/v1/wikipedia/en/search/page?limit=3&q=${req.query['page']}`);
    ser = await ser.json();
    ser = ser.pages.filter(p=>p.description!=="Topics referred to by the same term")[0];
    let data = await fetch(`https://api.wikimedia.org/core/v1/wikipedia/en/page/${ser.key}/html`);
    if (!data.ok) {
      res.json({
        title: '',
        img: '',
        data: '',
        err: true,
        msg: 'could not get page'
      })
      return;
    }
    data = await data.text();

    data = data
      .split('</head>')[1]
      .split('<h2 id="See_also">See also</h2>')[0]
      .split('<h2 id="Notes">Notes</h2>')[0]
      .replaceAll('/>', '>')
      .replaceAll(/<.+? style="display:none".*?>[^¬]*?<.+?>/g, '')
      .replaceAll(/<div .*?role="note".*?>[^¬]*?<\/div>/g, '')
      .replaceAll(/<.+? typeof="mw:Transclusion".*?>[^¬]*?<\/.+?>/g, '')
      .replaceAll(/<sup typeof="mw:Extension\/ref".*?>[^¬]*?<\/sup>/g, '')
      .replaceAll(/<ul.*? class="gallery.*?".*?>[^¬]*?<\/ul>/g, '')
      .replaceAll(/<div.*? class="mod-gallery.*?".*?>[^¬]*?<\/div>/g, '')
      .replaceAll(/<div class="mw-highlight mw-highlight-lang-jsx mw-content-ltr".*?>[^¬]*?<\/div>/g, function(match){
        let st = '<code'+match.split('-lang-')[1].split(' ')[0]+'>';
        match = match
          .replace(/<pre id=".*?">/, '<pre>')
          .split('<pre>')[1]
          .replace(/<.{0,1}div.*?(\\n|>)/g, '')
          .replaceAll(/<.{0,1}span.*?>/g, '')
          .replace(/<.{0,1}pre>/g, '')
          .replaceAll('>','&gt;').replaceAll('\\n','\n');
        return st+match+'</code>';
      })
      .replaceAll(/ (id|class|style|href|src|lang|dir|about|typeof|role|rel|title|colspan|rowspan|height|width|alt|data-mw-parsoid-version|data-mw-html-version|data-mw-section-id|data-sort-value|value|name|type|data-mw-group|scope|srcset|data-file-type|property|resource|data-file-width|data-file-height|decoding)=".*?"/g, '')
      .replaceAll(/ data-mw='.+?'/g, '')
      .replaceAll(/\[[0-9]{1,4}\]/g, '')
      .replaceAll(/<style.*?>[^¬]*?<\/style>/g, '')
      .replaceAll(/<table.*?>[^¬]*?<\/table>/g, '')
      .replaceAll(/<figure.*?>[^¬]*?<\/figure>/g, '')
      .replaceAll(/<link.*?>/g, '')
      .replaceAll(/<li.*?>/g, '- ')
      .replaceAll(/<.{0,1}h[0-6].*?>/g, '**')
      .replaceAll(/<.{0,1}b.*?>/g, '**')
      .replaceAll(/<.{0,1}i.*?>/g, '*')
      .replaceAll(/<.{0,1}sup.*?>/g, '')
      .replaceAll(/<.{0,1}ul.*?>/g, '')
      .replaceAll(/<.{0,1}u.*?>/g, '__')
      .replaceAll(/<code.+?>[^¬]*?<\/code>/g, function(match){
        return '```'+match.split('code')[1].split('>')[0]+'\n'+match.split('>')[1].split('<')[0]+'\n```'
      })
      .replaceAll(/<.{0,1}code>/g, '`')
      .replaceAll(/<.+?>/g, '')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll(/\n{2,}/g, '\n')
      .trim();

    res.json({
      title: ser.title,
      img: ser.thumbnail ? ser.thumbnail.url?.replace('//', 'https://') : '',
      data: data
    })
  }
}