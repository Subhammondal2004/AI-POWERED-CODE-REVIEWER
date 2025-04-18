const generateAIResponse =require('../services/ai-services');

const getAIResponse = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required!' });
    }

    const aiResult = await generateAIResponse(code);
    res.status(200).send(aiResult);

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ message: 'Failed to generate AI response' });
  }
};

module.exports = { getAIResponse };
