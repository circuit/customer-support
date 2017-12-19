/* jslint node: true */
'use strict';

const Circuit = require('circuit-sdk');
const config = require('./config.json');

let client;
let emitter;
let appUserId;

//Circuit.setLogger(console);
//Circuit.logger.setLevel(Circuit.Enums.LogLevel.Debug);

function init (events) {
  emitter = events;
  client = new Circuit.Client(config.bot);
  return client.logon()
    .then(user => appUserId = user.userId)
    .then(setupListeners);
}

function createConversation(userIds, name) {
    return client.createGroupConversation(userIds, `Cust: ${name}`);
}

function getUsersByEmail(emails) {
  return client.getUsersByEmail(emails)
}

function sendMessage(convId, obj) {
  return client.addTextItem(convId, obj)
}

function getMessages(convId, threadId) {
  // getItemsByThread does not include the parent, so get it first
  // or does it???
  return new Promise((resolve, reject) => {
    let res = [];
    client.getItemById(threadId)
      //.then(item => res.push(item))
      .then(() => client.getItemsByThread(convId, threadId, { number: -1 }))
      .then(resp => res.push(...resp.items))
      .then(() => {
        res = res.map(m => {
          return {
            content: m.text.content,
            fromCustomer: m.creatorId === appUserId,
            timestamp: m.creationTime
          }
        });
        resolve(res);
      })
      .catch(reject);
  });
}

/**
 * Setup the listeners
 */
function setupListeners() {
    client.addEventListener('itemAdded', evt => {
      // Raise text messages for further processing
      console.log(evt);
      if (!evt.item.text) {
        // not a text message
        return;
      }
      emitter.emit('message-received', {
        convId: evt.item.convId,
        thread: evt.item.parentItemId || evt.item.itemId,
        message: evt.item.text.content,
        fromCustomer: evt.item.creatorId === appUserId
      });
    });

    client.addEventListener('itemUpdated', evt => {
      // Raise text messages for further processing
      console.log(evt);
      if (!evt.item.text) {
        // not a text message
        return;
      }
      emitter.emit('thread-updated', {
        convId: evt.item.convId,
        thread: evt.item.parentItemId || evt.item.itemId
      });
    });
}

Circuit.Injectors.itemInjector = function (item) {
  if (item.type === 'TEXT') {
    // Replacing br and hr tags with a space
    item.text.content = item.text.content.replace(/<(\/li|hr[\/]?)>/gi, '<br>');
  }
};

module.exports = {
    init,
    createConversation,
    sendMessage,
    getMessages,
    getUsersByEmail
}
