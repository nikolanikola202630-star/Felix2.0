// Voice API
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audio } = req.body;

    // Mock voice recognition
    return res.json({
      success: true,
      text: 'Привет! Это распознанный текст из голосового сообщения.',
      confidence: 0.95
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
