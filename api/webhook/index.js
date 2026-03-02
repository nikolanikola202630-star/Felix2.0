// Felix Bot - Test Version
module.exports = (req, res) => {
  // Health check
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'ok', 
      bot: 'Felix v7.0 TEST',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message } = req.body;
    
    res.status(200).json({ 
      ok: true,
      received: !!message,
      text: message?.text || 'no text'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message
    });
  }
};
