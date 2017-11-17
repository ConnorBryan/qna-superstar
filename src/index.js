/*
  🌠 🌠 🌠 🌠 🌠 🌠 🌠 🌠

  [Q & A]
    S U P E R S T A R

  🌠 🌠 🌠 🌠 🌠 🌠 🌠 🌠 
    
        by Connor Bryan
*/

/* 🌠 Process environment variable file 🌠 */
require('dotenv').load();

import axios from 'axios';
import fs from 'fs';

const {
  BOT_TOKEN,
  CHANNEL_ID,
  INITIAL_MESSAGE_ID,
  FINAL_MESSAGE_ID,
  RESPONDER,
  QNA_MARKER = '[Q&A]',
  OUTPUT_FILE_NAME = 'Q&A.txt',
} = process.env;

[BOT_TOKEN, CHANNEL_ID, INITIAL_MESSAGE_ID, FINAL_MESSAGE_ID, RESPONDER]
  .forEach(environmentVariable => {
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

export const API_URL = 'https://discordapp.com/api/v6';
export const QNA = new Map();
export const USER_ID_TO_USERNAME = new Map();
export const QNA_TIMER = 'Finished Q&A session in';
export const AXIOS_CONFIG = {
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
  },
};

beASuperStar();

/* 🌠 🌠 🌠 */

/**
 * @async
 * @function beASuperStar
 * @desc Parse a Q&A session and output a file to the specified directory.
 * @returns {boolean}
 */
export async function beASuperStar() {
  try {
    console.time(QNA_TIMER);
    
    const messages = await getFullMessages();

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

    await outputFile(QNA);
  } catch (e) {
    console.error(`🌠 I tried my best... I promise. 🌠`, e);
  } finally {
    console.timeEnd(QNA_TIMER);

    return true;
  }
}

/* 🌠 🌠 🌠 */

/**
 * @async
 * @function get
 * @desc Retrieve an array of messages from the Discord API.
 * @param {string} path
 * @returns {Array<object>}
 */
export async function get(path) {
  try {
    const { data } = await axios.get(`${API_URL}/${path}`, AXIOS_CONFIG);

    return data;
  } catch (e) {
    console.error(`Unable to GET ${path}`, e);
  }
}

/**
 * @async
 * @function getMessages
 * @desc Given a channel ID and a starting message, retrieve relevant messages.
 * @param {string} channelID
 * @param {string} after - messageID 
 * @returns {Array<object>}
 */
export async function getMessages(channelID, after) {
  try {
    return await get(`/channels/${channelID}/messages?after=${after}&limit=100`);
  } catch (e) {
    console.error(`Unable to retrieve messages from channelID ${channelID}`, e);
  }
}

/**
 * @async
 * @function getFullMessages
 * @desc Retrieve all messages between the initial message and the final message..
 * @returns {Array<object>}
 */
export async function getFullMessages() {
  try {
    let messages = (await getMessages(CHANNEL_ID, INITIAL_MESSAGE_ID)).reverse();
    let finalMessageIndex = findFinalMessage(messages);

    while (finalMessageIndex === -1) {
      const { id: lastMessageID } = messages[messages.length - 1];

      messages = messages.concat(
        (await getMessages(CHANNEL_ID, lastMessageID)).reverse()
      );

      finalMessageIndex = findFinalMessage(messages);
    }

    return messages;
  } catch (e) {
    console.error(`Unable to get the full set of messages`, e);
  }
}

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
export async function outputFile(qna) {
  try {
    const responder = USER_ID_TO_USERNAME.get(RESPONDER);

    let questionCount = 0;
    let answerCount = 0;
    let dialogues = '';

    qna.forEach((dialogue, userID) => {
      const username = USER_ID_TO_USERNAME.get(userID);
      const questions = dialogue.filter(message => message.includes('Q)')).length;
      const answers = dialogue.filter(message => message.includes('A)')).length;

      questionCount += questions;
      answerCount += answers;
      dialogues += `${username}:\n    ${dialogue.join('\n    ')}`;
    });

    const template = `Responder: ${responder}\nQuestion count: ${questionCount}\nAnswer count: ${answerCount}`
      + `\n\nTranscript:\n\n  ${dialogues}`;

    await new Promise((resolve, reject) => fs.writeFile(OUTPUT_FILE_NAME, template, 'utf8', err => err ? reject(err) : resolve()));

    return true;
  } catch (e) {
    console.error(`Unable to output to file`, e);

    return false;
  }
}

/**
 * @function findFinalMessage
 * @desc Given an array of messages, find the index of the specified final message.
 * @param {Array<object>} messages 
 * @returns {number}
 */
export function findFinalMessage(messages) {
  return messages.findIndex(({ id }) => id === FINAL_MESSAGE_ID);
}

/**
 * @function isFromResponder
 * @desc Given a message, was it sent by the responder?
 * @param {object} message
 * @returns {boolean}
 */
export function isFromResponder({ author: { username } }) {
  return username === RESPONDER;
}

/**
 * @function hasQuestion
 * @desc Given a message, does it contain a question?
 * @param {object} message
 * @returns {boolean}
 */
export function hasQuestion({ content }) {
  return content.includes(QNA_MARKER);
}

/**
 * @function parseQuestion
 * @desc Given a message, return both the question asker's userID and the question's content.
 *       If the userID map doesn't have a record of the userID, add it.
 * @param {object} message
 * @returns {object}
 */
export function parseQuestion({ content, author: { id, username } }) {
  const question = content
    .split(' ')
    .filter(word => word !== QNA_MARKER)
    .join(' ');

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
export function addAQuestion(qna, id, question) {
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
export function hasTaggedUser({ content }) {
  return content
    .split(' ')
    .filter(word => word.includes('@'))
    .length > 0;
}

/**
 * @function parseTaggedUser
 * @desc Given a message, return the user ID of the first tagged user.
 * @param {object} message
 * @returns {string}
 */
export function parseTaggedUser({ content }) {
  const taggedUser = content
    .split(' ')
    .filter(word => word.includes('@'))[0];
  
  // Transform <@310217929201287168> ' to '310217929201287168'
  return taggedUser.substr(2, taggedUser.length - 3);
}

/**
 * @function parseAnswer
 * @desc Given a message, return all non-user-tagged words as a single string.
 * @param {object} message
 * @returns {string}
 */
export function parseAnswer({ content }) {
  return content
    .split(' ')
    .filter(word => !word.includes('@'))
    .join(' ');
}

/**
 * @function addAnAnswer
 * @desc Update the Q&A map with an answer at the specified user ID.
 * @param {object} message
 * @returns {string}
 */
export function addAnAnswer(qna, id, answer) {
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
export function addResponderUsername({ author: { username } }) {
  return USER_ID_TO_USERNAME.set(RESPONDER, username);
}