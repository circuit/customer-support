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
  return client.getItemsByThread(convId, threadId, { number: -1 })
    .then(res => res.items.map(m => {
        return {
          content: m.text.content,
          fromCustomer: m.creatorId === appUserId,
          timestamp: m.creationTime
        }
      })
    );
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
        message: evt.item.text.content
      });
    });
}

module.exports = {
    init,
    createConversation,
    sendMessage,
    getMessages,
    getUsersByEmail
}
