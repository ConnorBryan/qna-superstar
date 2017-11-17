'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outputFile = exports.getFullMessages = exports.getMessages = exports.get = exports.beASuperStar = exports.AXIOS_CONFIG = exports.QNA_TIMER = exports.USER_ID_TO_USERNAME = exports.QNA = exports.API_URL = exports.OUTPUT_FILE_NAME = exports.QNA_MARKER = exports.RESPONDER = exports.FINAL_MESSAGE_ID = exports.INITIAL_MESSAGE_ID = exports.CHANNEL_ID = exports.BOT_TOKEN = undefined;

/* 🌠 🌠 🌠 */

/**
 * @async
 * @function beASuperStar
 * @desc Parse a Q&A session and output a file to the specified directory.
 * @returns {boolean}
 */
let beASuperStar = exports.beASuperStar = (() => {
  var _ref = _asyncToGenerator(function* () {
    try {
      console.time(QNA_TIMER);

      const messages = yield getFullMessages();

      for (let message of messages) {
        const fromResponder = isFromResponder(message);

        if (fromResponder) {
          const hasATaggedUser = hasTaggedUser(message);

          if (!USER_ID_TO_USERNAME.get(RESPONDER)) addResponderUsername(message);

          if (hasATaggedUser) {
            const taggedUser = parseTaggedUser(message);
            const answer = parseAnswer(message);

            addAnAnswer(QNA, taggedUser, answer);
          }
        } else {
          const hasAQuestion = hasQuestion(message);

          if (hasAQuestion) {
            const { id, question } = parseQuestion(message);

            addAQuestion(QNA, id, question);
          }
        }
      }

      yield outputFile(QNA);
    } catch (e) {
      console.error(`🌠 I tried my best... I promise. 🌠`, e);
    } finally {
      console.timeEnd(QNA_TIMER);

      return true;
    }
  });

  return function beASuperStar() {
    return _ref.apply(this, arguments);
  };
})();

/* 🌠 🌠 🌠 */

/**
 * @async
 * @function get
 * @desc Retrieve an array of messages from the Discord API.
 * @param {string} path
 * @returns {Array<object>}
 */


let get = exports.get = (() => {
  var _ref2 = _asyncToGenerator(function* (path) {
    try {
      const { data } = yield _axios2.default.get(`${API_URL}/${path}`, AXIOS_CONFIG);

      return data;
    } catch (e) {
      console.error(`Unable to GET ${path}`, e);
    }
  });

  return function get(_x) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @async
 * @function getMessages
 * @desc Given a channel ID and a starting message, retrieve relevant messages.
 * @param {string} channelID
 * @param {string} after - messageID 
 * @returns {Array<object>}
 */


let getMessages = exports.getMessages = (() => {
  var _ref3 = _asyncToGenerator(function* (channelID, after) {
    try {
      return yield get(`/channels/${channelID}/messages?after=${after}&limit=100`);
    } catch (e) {
      console.error(`Unable to retrieve messages from channelID ${channelID}`, e);
    }
  });

  return function getMessages(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * @async
 * @function getFullMessages
 * @desc Retrieve all messages between the initial message and the final message..
 * @returns {Array<object>}
 */


let getFullMessages = exports.getFullMessages = (() => {
  var _ref4 = _asyncToGenerator(function* () {
    try {
      let messages = (yield getMessages(CHANNEL_ID, INITIAL_MESSAGE_ID)).reverse();
      let finalMessageIndex = findFinalMessage(messages);

      while (finalMessageIndex === -1) {
        const { id: lastMessageID } = messages[messages.length - 1];

        messages = messages.concat((yield getMessages(CHANNEL_ID, lastMessageID)).reverse());

        finalMessageIndex = findFinalMessage(messages);
      }

      return messages;
    } catch (e) {
      console.error(`Unable to get the full set of messages`, e);
    }
  });

  return function getFullMessages() {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * @async
 * @function outputFile
 * @desc Given a map of userID -> Array<QuestionsAnswers>, output a file formatted as such:
 * 
 * Responder: someImportantGuy
 * Question count: 3
 * Answer count: 3
 * 
 * Transcript:
 * 
 *   username1:
 *      Q) Why is your hair red?
 *      A) I was born that way.
 *        
 *   username2:
 *      Q) What's your favorite day of the week?
 *      A) Don't you have anything better to ask?
 *      Q) How many finger am I holding up?
 *      A) You're quadriplegic;
 * 
 * @param {Map} qna
 * @returns {boolean}
 */


let outputFile = exports.outputFile = (() => {
  var _ref5 = _asyncToGenerator(function* (qna) {
    try {
      const responder = USER_ID_TO_USERNAME.get(RESPONDER);

      let questionCount = 0;
      let answerCount = 0;
      let dialogues = '';

      qna.forEach(function (dialogue, userID) {
        const username = USER_ID_TO_USERNAME.get(userID);
        const questions = dialogue.filter(function (message) {
          return message.includes('Q)');
        }).length;
        const answers = dialogue.filter(function (message) {
          return message.includes('A)');
        }).length;

        questionCount += questions;
        answerCount += answers;
        dialogues += `${username}:\n    ${dialogue.join('\n    ')}`;
      });

      const template = `Responder: ${responder}\nQuestion count: ${questionCount}\nAnswer count: ${answerCount}` + `\n\nTranscript:\n\n  ${dialogues}`;

      yield new Promise(function (resolve, reject) {
        return _fs2.default.writeFile(OUTPUT_FILE_NAME, template, 'utf8', function (err) {
          return err ? reject(err) : resolve();
        });
      });

      return true;
    } catch (e) {
      console.error(`Unable to output to file`, e);

      return false;
    }
  });

  return function outputFile(_x4) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * @function findFinalMessage
 * @desc Given an array of messages, find the index of the specified final message.
 * @param {Array<object>} messages 
 * @returns {number}
 */


exports.findFinalMessage = findFinalMessage;
exports.isFromResponder = isFromResponder;
exports.hasQuestion = hasQuestion;
exports.parseQuestion = parseQuestion;
exports.addAQuestion = addAQuestion;
exports.hasTaggedUser = hasTaggedUser;
exports.parseTaggedUser = parseTaggedUser;
exports.parseAnswer = parseAnswer;
exports.addAnAnswer = addAnAnswer;
exports.addResponderUsername = addResponderUsername;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/*
  🌠 🌠 🌠 🌠 🌠 🌠 🌠 🌠

  [Q & A]
    S U P E R S T A R

  🌠 🌠 🌠 🌠 🌠 🌠 🌠 🌠 
    
        by Connor Bryan
*/

/* 🌠 Process environment variable file 🌠 */
require('dotenv').load();

const BOT_TOKEN = exports.BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = exports.CHANNEL_ID = process.env.CHANNEL_ID;
const INITIAL_MESSAGE_ID = exports.INITIAL_MESSAGE_ID = process.env.INITIAL_MESSAGE_ID;
const FINAL_MESSAGE_ID = exports.FINAL_MESSAGE_ID = process.env.FINAL_MESSAGE_ID;
const RESPONDER = exports.RESPONDER = process.env.RESPONDER;
const QNA_MARKER = exports.QNA_MARKER = process.env.QNA_MARKER || '[Q&A]';
const OUTPUT_FILE_NAME = exports.OUTPUT_FILE_NAME = process.env.OUTPUT_FILE_NAME || 'q&a.txt';

[BOT_TOKEN, CHANNEL_ID, INITIAL_MESSAGE_ID, FINAL_MESSAGE_ID, RESPONDER].forEach(environmentVariable => {
  if (!environmentVariable) throw Error(`
      A required environment variable is missing.
      Make sure you pass in:
        * BOT_TOKEN
        * CHANNEL_ID
        * INITIAL_MESSAGE_ID
        * FINAL_MESSAGE_ID
        * RESPONDER
    `);
});

const API_URL = exports.API_URL = 'https://discordapp.com/api/v6';
const QNA = exports.QNA = new Map();
const USER_ID_TO_USERNAME = exports.USER_ID_TO_USERNAME = new Map();
const QNA_TIMER = exports.QNA_TIMER = 'Finished Q&A session in';
const AXIOS_CONFIG = exports.AXIOS_CONFIG = {
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`
  }
};

beASuperStar();function findFinalMessage(messages) {
  return messages.findIndex(({ id }) => id === FINAL_MESSAGE_ID);
}

/**
 * @function findFinalMessage
 * @desc Given a message, was it sent by the responder?
 * @param {object} message
 * @returns {boolean}
 */
function isFromResponder({ author: { username } }) {
  return username === RESPONDER;
}

/**
 * @function hasQuestion
 * @desc Given a message, does it contain a question?
 * @param {object} message
 * @returns {boolean}
 */
function hasQuestion({ content }) {
  return content.includes(QNA_MARKER);
}

/**
 * @function parseQuestion
 * @desc Given a message, return both the question asker's userID and the question's content.
 *       If the userID map doesn't have a record of the userID, add it.
 * @param {object} message
 * @returns {object}
 */
function parseQuestion({ content, author: { id, username } }) {
  const question = content.split(' ').filter(word => word !== QNA_MARKER).join(' ');

  if (!USER_ID_TO_USERNAME.get(id)) USER_ID_TO_USERNAME.set(id, username);

  return { id, question };
}

/**
 * @function addAQuestion
 * @desc Update the Q&A map with a question at the specified user ID.
 * @param {Map} qna
 * @param {string} id
 * @param {string} question
 * @returns {Map}
 */
function addAQuestion(qna, id, question) {
  const previousQuestions = qna.get(id);

  question = `Q) ${question}`;

  return qna.set(id, previousQuestions ? previousQuestions.concat(question) : [question]);
}

/**
 * @function hasTaggedUser
 * @desc Given a message, does it contain a tagged user? e.g. @connor#5456
 * @param {object} message
 * @returns {boolean}
 */
function hasTaggedUser({ content }) {
  return content.split(' ').filter(word => word.includes('@')).length > 0;
}

/**
 * @function parseTaggedUser
 * @desc Given a message, return the user ID of the first tagged user.
 * @param {object} message
 * @returns {string}
 */
function parseTaggedUser({ content }) {
  const taggedUser = content.split(' ').filter(word => word.includes('@'))[0];

  // Transform <@310217929201287168> ' to '310217929201287168'
  return taggedUser.substr(2, taggedUser.length - 3);
}

/**
 * @function parseAnswer
 * @desc Given a message, return all non-user-tagged words as a single string.
 * @param {object} message
 * @returns {string}
 */
function parseAnswer({ content }) {
  return content.split(' ').filter(word => !word.includes('@')).join(' ');
}

/**
 * @function addAnAnswer
 * @desc Update the Q&A map with an answer at the specified user ID.
 * @param {object} message
 * @returns {string}
 */
function addAnAnswer(qna, id, answer) {
  const previousQuestions = qna.get(id) || [];

  answer = `A) ${answer}`;

  return qna.set(id, previousQuestions.concat(answer));
}

/**
 * @function addResponderUsername
 * @desc Add an entry in the user ID map for the responder for file output purposes.
 * @param {object} message
 * @returns {Map}
 */
function addResponderUsername({ author: { username } }) {
  return USER_ID_TO_USERNAME.set(RESPONDER, username);
}