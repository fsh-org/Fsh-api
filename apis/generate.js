const { InferenceClient } = require('@huggingface/inference');
const hf = new InferenceClient(process.env['ai'], { retry_on_error: false });

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
      default: 'HuggingFaceTB/SmolLM3-3B'
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
      if(!req.query['text']) {
        res.type('text/plain').send('mini docs<br>text=[TEXT] - Text for generation<br>Optional:<br>model=[Model] - Very high level but allows for better text<br>when generating text a object will be automaticly created with all the past conversation (if not set every call will be treated as a new conversation)');
        return;
      };
      let con = [];
      if (req.query['conversation']) {
        try {
          con = JSON.parse(req.query['conversation']);
        } catch (err) {
          // Ignore :3
        }
      }
      con.push({ role: 'user', content: req.query['text'] });
      let out = await hf.chatCompletion({
        model: req.query['model'] ?? 'HuggingFaceTB/SmolLM3-3B',
        messages: con,
        max_tokens: 512
      });
      con.push({ role: 'assistant', content: out.choices?.[0]?.message?.content });

      res.json({
        generated_text: out.choices?.[0]?.message?.content,
        conversation: con
      });
    } catch (err) {
      res.error(err, 500);
    }
  }
}