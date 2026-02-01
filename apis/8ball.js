let responses = ['yes', 'no', 'probably', 'maybe', 'never', 'likely', 'very likely', 'unlikely', 'very unlikely', 'ask later', 'sure, why not', "don't, why", 'good', 'bad', '**NO**', '**YES**', 'when you grow a braincell, yes', 'no, how about you grow some braincells', 'nuh uh', 'yuh uh', 'of course', 'doubtful', 'later', 'missed the chance', 'outlook good', 'outlook bad', 'certainly', 'uncertain', 'secret', 'on my break, try again later', 'ask your mom', 'ask your dad'];

module.exports = {
  path: '/8ball',
  info: '8ball responses',
  type: 'get',
  params: [],
  category: 'text',

  async execute(req, res) {
    res.json({
      response: responses[Math.floor(Math.random()*responses.length)]
    });
  }
}