let responses = ['yes', 'no', 'probably', 'maybe', 'never', 'likely', 'very likely', 'unlikely', 'very unlikely', 'ask later', 'sure, why not', "don't, why", 'good', 'bad', '**NO**', '**YES**', 'when you grow a braincell, yes', 'no, how about you grow some braincells', 'nuh uh', 'yuh uh'];

module.exports = {
  path: '/8ball',
  info: '8ball responses',
  type: 'get',
  params: [],
  category: 'text',

  async execute(req, res) {
    const random = Math.floor(Math.random() * responses.length);

    res.json({
      response: responses[random]
    })
  }
}