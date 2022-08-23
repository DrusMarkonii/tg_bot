import TelegramApi from "node-telegram-bot-api";
import dotenv from "dotenv";

import Options from "./options.js";
import { commands } from "./constants.js";

const { againGameOptions, gameOptions } = Options;

dotenv.config();

const bot_token = process.env.BOT_TOKEN;
const bot = new TelegramApi(bot_token, { polling: true });
const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Я загадываю число от 0 до 9, а ты отгадай`);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  return bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const textCommands = (commands) => {
  return `Ты можешь использовать следующие команды: 
    ${commands.map(
      ({ command, description }) => `\r\n${command} - ${description}`
    )};`;
};

const availableCommands = async (chatId) => {
  await bot.sendMessage(chatId, textCommands(commands));
};

const start = () => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.username;

    bot.setMyCommands(() => commands);

    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        `Добро пожаловать в самый лучший телеграм бот!`
      );
      availableCommands(chatId);
      return bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/256/17.webp"
      );
    }

    if (text === "/info") {
      return bot.sendMessage(chatId, `Тебя зовут ${userName}`);
    }

    if (text === "/game") {
      return startGame(chatId);
    }

    if (text === "/help") {
      return availableCommands(chatId);
    }

    return bot.sendMessage(chatId, "выбири другую команду, я не понимаю(");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === "/again") {
      return startGame(chatId);
    }
    if (+data === chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Ты справился, загаданное число - ${chats[chatId]}`,
        againGameOptions
      );
    } else {
      return bot.sendMessage(
        chatId,
        `К сожалению, ты ошибся. Я задал цифру ${chats[chatId]}`,
        againGameOptions
      );
    }
  });
};

start();
