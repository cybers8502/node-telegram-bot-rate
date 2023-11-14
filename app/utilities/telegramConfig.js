const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const telegramConfig = new TelegramBot(TOKEN, {polling: true});
module.exports.bot = telegramConfig;
