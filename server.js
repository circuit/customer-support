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

const EventEmitter = require('events');
const express = require('express');
const app = express();
const circuit = require('./circuit');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3100;
const config = require('./config.json');
const complaints = require('./complaints.json');
const emitter = new EventEmitter();

let supportUserIds;

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

circuit.init(emitter)
  .then(() => circuit.getUsersByEmail(config.supportUsers))
  .then(users => supportUserIds = users.map(user => user.userId))
  .catch(console.error);

/**
 * Circuit module events
 */
emitter.on('msg-to-customer', _ => {
  console.log('send msg-to-customer');
    //io.in('operator').emit('patients', patients.map(p => {return p.info;}));
});

/**
 * Client socket.io connections
 */
io.on('connection', async socket => {
  let query = socket.handshake.query;
  console.log('socket connected', socket.id);

  // New complaint from form
  socket.on('new-complaint', async data => {
    console.log('new-complaint', data);
    try {
      // Create group conversation
      let conv = await circuit.createConversation(supportUserIds, data.name);

      // Post initial message which creates the thread for customer communication
      let item = await circuit.sendMessage(conv.convId, {
        subject: `*** New complaint: ${data.name}`,
        context: `Name: ${data.name}<br>Email: <a mailto="${data.email}">${data.email}</a>`
      });

      // Post initial complaint message
      circuit.sendMessage(conv.convId, data.content);

      // Create complaint in database
      let newComplaintId = complaints.length ? ++complaints[complaints.length - 1].complaintId : config.complaintIdStart;
      let newComplaint = {
        convId: conv.convId,
        complaintId: newComplaintId,
        customer: {
          name: data.name,
          email: data.email
        }
      }
      complaints.push(newComplaint);

      // Tell client to edirect to complaint page
      socket.emit('complaint-created', newComplaintId);
    } catch (err) {
      console.error('Error creating new complaint', err);
    }
  });
});

server.listen(port, _ => console.log(`Server listening at port ${port}`));
