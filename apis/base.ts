module.exports = {
  path: '/page', // path to website, remember to add / in front
  info: 'info', // info shown in main page
  type: 'get', // http type (get, post, etc) (just visual does nothing)
  params: ["h", true], // params if no params put []
  category: "hidden", // category (only some appear in menu)
  
  async execute(req, res) {
    
  }
}