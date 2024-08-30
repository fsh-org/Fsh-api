module.exports = {
  path: '/generate',
  info: 'Generates text with ai',
  type: 'get',
  params: [
    {
      name: 'text',
      required: true,
      default: 'What is a fish'
    },
    {
      name: 'model',
      required: false,
      default: 'google/gemma-2b-it'
    },
    {
      name: 'conversation',
      required: false,
      default: ''
    }
  ],
  category: "text",

  async execute(req, res) {
    try {
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
      let txt = req.query["text"];
      const response = await fetch(
        "https://api-inference.huggingface.co/models/"+(req.query['model'] || 'google/gemma-2b-it'),
        {
          headers: {
            Authorization: `Bearer ${process.env['ai']}`,
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({
            inputs: txt,
            past_user_inputs: con.past_user_inputs || [],
            generated_responses: con.generated_responses || []
          })
        }
      );
      let result = await response.json();
      if (result.error) {
        throw new Error(result.error)
      }

      let pu = (con.past_user_inputs || []);
      pu.push(txt)
      let pb = (con.generated_responses || []);
      pb.push(result[0].generated_text)

      res.json({
        generated_text: result[0].generated_text,
        conversation: {
          past_user_inputs: pu,
          generated_responses: pb,
        }
      })
    } catch (err) {
      res.error(err, 500)
    }
  }
}