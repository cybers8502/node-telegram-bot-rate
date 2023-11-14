const {bot} = require('./utilities/telegramConfig');
const {SESSION} = require('./constants/session');
const botCommandHelp = require('./services/helpBotCommand');
const botCommandAuth = require('./services/authBotCommand');
const search = require('./services/search');
const getUserAuthStatus = require('./services/getUserAuthStatus');
const {adminFirestore} = require('./utilities/firebaseConfig');

module.exports = () => {
  const products = require('./db/culttobacco.json');
  const userSessions = {};

  bot.onText(/\/help/, (msg) => botCommandHelp({msg: msg}));

  bot.onText(/\/auth/, (msg) => botCommandAuth({msg: msg}));

  bot.onText(/\/rate/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userExist = getUserAuthStatus(userId);

    if (userExist) {
      bot.sendMessage(chatId, `Тілики для зарестрованих користувачів, використайте команду /auth`);
      return;
    }

    const userKey = `${chatId}_${userId}`;

    if (Object.values(SESSION).includes(userSessions[userKey])) return;

    bot.sendMessage(chatId, 'Впишіть код табаку який хочете оцінити');
    userSessions[userKey] = SESSION.RATE;
  });

  bot.onText(/\/search/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userKey = `${chatId}_${userId}`;

    if (Object.values(SESSION).includes(userSessions[userKey])) return;

    bot.sendMessage(chatId, 'Впишіть код табаку або смак для пошуку.');
    userSessions[userKey] = SESSION.SEARCH;
  });

  bot.onText(/\/watch/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userKey = `${chatId}_${userId}`;

    bot.sendMessage(chatId, 'Все про табак.');
    userSessions[userKey] = 'awaiting_watch_response';
  });

  bot.onText(/\/top/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Популярні продуктов згідно рейтингу.');
  });

  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userKey = `${chatId}_${userId}`;

    if (Object.values(SESSION).includes(userSessions[userKey])) {
      delete userSessions[userKey];
      bot.sendMessage(chatId, 'Всі сессії завершені.');
      return;
    }

    bot.sendMessage(chatId, 'У Вас не має активних сессії.');
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userKey = `${chatId}_${userId}`;
    const text = msg.text;

    const isCommand = /^\/(?!help|auth|rate|search|watch|top|cancel)[a-zA-Z0-9_]+/.test(text);
    if (isCommand && !userSessions[userKey]) {
      bot.sendMessage(chatId, `Команда не зрозуміла, використайте /help щоб знайти необхідний запит`);
      return;
    }

    const strippedText = text.startsWith('/') ? text.slice(1) : text;

    switch (userSessions[userKey]) {
      case SESSION.RATE:
        if (!products.includes(strippedText)) {
          bot.sendMessage(chatId, `Такого табака ${strippedText} не неє. Перевірте коректний код.`);
          return;
        }

        const opts = {
          reply_markup: {
            inline_keyboard: [
              [
                {text: '1', callback_data: '1'},
                {text: '2', callback_data: '2'},
                {text: '3', callback_data: '3'},
                {text: '4', callback_data: '4'},
                {text: '5', callback_data: '5'},
              ],
              [{text: 'Отказаться', callback_data: 'decline'}],
            ],
          },
        };

        bot.sendMessage(chatId, `Ви обрали ${strippedText}. Оцініть ваш вибір:`, opts);
        break;
      case SESSION.SEARCH:
        const result = search(strippedText);

        if (!result || result.length === 0) {
          bot.sendMessage(chatId, `Нічого не можу знайти за ${strippedText}.`);
          return;
        }

        const productNames = result.map((product) => product.name).join('\n\n');
        bot.sendMessage(chatId, productNames);

        delete userSessions[userKey];

        break;
    }
  });

  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const userKey = `${chatId}_${userId}`;
    const data = query.data;

    switch (userSessions[userKey]) {
      case SESSION.RATE:
        if (data === 'decline') {
          bot.sendMessage(chatId, 'Ви відмовились від оцінки.');
        } else {
          bot.sendMessage(chatId, `Дякую за оцінку: ${data}!`);
        }
        delete userSessions[userKey];
        break;
      default:
        bot.sendMessage(chatId, `Не зрозуміла команда, використайте /help щоб знайти необхідний запит`);
    }
  });

  bot.on('polling_error', (error) => {
    console.log(error.code);
    console.error(error);
  });
};
