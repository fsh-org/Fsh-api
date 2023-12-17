const fs = require("fs").promises;

async function readFileAsync(filename) {
  try {
    return await fs.readFile(filename, "utf8");
  } catch (error) {
    console.error(`Error reading file: ${filename}`, error);
    throw error;
  }
}

module.exports = {
  path: '/test',
  info: 'Tells if sentence has bad words and censors them',
  type: 'get',
  params: ["text", true, "char", false, "category", false],
  category: "hidden",
  async execute(req, res) {
    const response = req.query["text"];

  if (!response) {
    res.send('{"bad": false, "censor": "", "mini-docs":"text = text to test; char = character to replace bad; category = what words to censor (adult, swear, slur) multiple allowed, empty for all, example: category=adult,swear"}');
    return;
  }

  const sie = req.query["char"] || "#";
  const cat = req.query["category"] || "adult,swear,slur";
  const categories = cat.split(",");

  try {
    const badWords = [];

    // Load and concatenate bad words from selected categories
    for (const category of categories) {
      const categoryWords = await readFileAsync(`text/${category}.txt`);
      badWords.push(...categoryWords.split(","));
    }

    const copy = response.toLowerCase();

    // Create a regular expression pattern for all bad words with word boundaries
    const badWordsPattern = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');

    // Replace bad words in parallel
    const censoredText = copy.replace(badWordsPattern, (match) => sie.repeat(match.length));

    const good = response.toLowerCase() === copy;

    res.send(`{"bad": ${good ? "false" : "true"}, "censor": "${good ? response : censoredText}"}`);
    } catch (error) {
      // Handle errors
      res.status(500).send(`{"error": "Internal server error", "msg": "${error}"}`);
    }
  }
}