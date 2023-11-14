const {bot} = require('../utilities/telegramConfig');

module.exports = async ({msg}) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    'Это помощь по боту. Здесь вы можете получить информацию о том, как использовать бота.',
  );
};
