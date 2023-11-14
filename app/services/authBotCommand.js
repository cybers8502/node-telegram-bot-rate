const {adminFirestore} = require('../utilities/firebaseConfig');
const {bot} = require('../utilities/telegramConfig');
const getUserAuthStatus = require('./getUserAuthStatus');

module.exports = async ({msg}) => {
  const chatId = msg.from.id;
  const userExist = getUserAuthStatus(chatId);

  if (!userExist) {
    await userRef.set({
      username: msg.from.username,
      createdAt: adminFirestore.FieldValue.serverTimestamp(),
    });
    await bot.sendMessage(chatId, `➕ ${msg.from.username} вдало зареєстрований`);
  } else {
    await bot.sendMessage(chatId, `✔️ ${msg.from.username} уже зареєстрований`);
  }
};
