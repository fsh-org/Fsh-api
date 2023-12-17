const hfimport = require('@huggingface/inference');
const hf = new hfimport.HfInference(process.env['ai']);

module.exports = {
	path: '/generate',
	info: 'Generates text with ai',
	type: 'get',
	params: ["text", true, "model", false, "conversation", false],
	category: "text",
	execute(req, res) {
    (async () => {
    try{
      if(!req.query["text"]) {
        res.send('mini docs<br>text=[TEXT] - Text for generation<br>Optional:<br>model=[Model] - Very high level but allows for better text<br>when generating text a object will be automaticly created with all the past conversation (if not set every call will be treated as a new conversation)');
        return;
      };
      let con;
      if (req.query["conversation"]) {
        try {
          con = JSON.parse(req.query["conversation"])
        } catch (err) {
          con = {
            past_user_inputs: [],
            generated_responses: []
          };
        }
      } else {
        con = {
          past_user_inputs: [],
          generated_responses: []
        };
      }
		  let img = await hf.conversational({
				inputs: {
          past_user_inputs: con.past_user_inputs || [],
          generated_responses: con.generated_responses || [],
          text: req.query["text"]
        },
			  model: req.query["model"] || 'facebook/blenderbot-400M-distill'
			});
      res.send(img)
    } catch (err) {
      res.status(500)
      res.send(`{"err":true,"msg":"${err}"}`)
    }
    })()
	}
}