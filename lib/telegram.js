const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const telegram = {
  // Send message
  async sendMessage(chatId, text, options = {}) {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode || 'HTML',
        reply_markup: options.replyMarkup
      })
    });

    return response.json();
  },

  // Send typing action
  async sendTyping(chatId) {
    await fetch(`${API_URL}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    });
  },

  // Get file
  async getFile(fileId) {
    const response = await fetch(`${API_URL}/getFile?file_id=${fileId}`);
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error('Failed to get file');
    }

    const filePath = data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    
    const fileResponse = await fetch(fileUrl);
    return fileResponse.arrayBuffer();
  },

  // Create inline keyboard
  createKeyboard(buttons) {
    return {
      inline_keyboard: buttons
    };
  }
};
