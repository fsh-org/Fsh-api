module.exports = {
  path: '/page', // path to website, remember to add / in front
  info: 'info', // info shown in main page
  type: 'get', // http type (get, post, etc) (just visual does nothing)
  params: [ // params if no params put []
    {
      name: 'param', // Name
      required: true, // If its required
      default: 'fsh' // An example imput
    }
  ],
  category: "hidden", // category (only some appear in menu)

  async execute(req, res) {
    
  }
}