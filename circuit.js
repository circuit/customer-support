/*
    Copyright (c) 2017 Unify Inc.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* jslint node: true */
'use strict';

const Circuit = require('circuit-sdk');
const config = require('./config.json');

let client;
let emitter;

//Circuit.setLogger(console);
//Circuit.logger.setLevel(Circuit.Enums.LogLevel.Debug);

/**
 * Initialize
 * @param {Object} events Event emitter
 */
function init (events) {
  emitter = events;
  client = new Circuit.Client(config.bot);
  return client.logon()
    .then(setupListeners);
}

/**
 * Create a conversation
 * @param {Object}
 */
function createConversation(userIds, name) {
    return client.createGroupConversation(userIds, `Cust: ${name}`);
}

function getUsersByEmail(emails) {
  return client.getUsersByEmail(emails)
}

function sendMessage(convId, obj) {
  return client.addTextItem(convId, obj)
}

/**
 * Setup the listeners
 */
function setupListeners() {
    client.addEventListener('itemAdded', evt => {
      console.log(evt);
    });
}

module.exports = {
    init,
    createConversation,
    sendMessage,
    getUsersByEmail
}
