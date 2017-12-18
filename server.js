/* jslint node: true */
'use strict';

const fs = require('fs');
const EventEmitter = require('events');
const express = require('express');
const app = express();
const circuit = require('./circuit');
const mailer = require('./mailer');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const jsonfile = require('jsonfile');

const port = process.env.PORT || 3100;
const config = require('./config.json');
const emitter = new EventEmitter();

const db = './complaints.json';

let supportUserIds;

// Serve pages
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

// Create complaints.json file if not exits
const exists = fs.existsSync(db);
!exists && fs.writeFileSync(db, '[]');
const complaints = jsonfile.readFileSync(db);

// Initialize Circuit API
circuit.init(emitter)
  .then(() => circuit.getUsersByEmail(config.supportUsers))
  .then(users =>
    supportUserIds = users.map(user => user.userId))
  .catch(console.error);

// Client socket.io connections
io.on('connection', async socket => {
  let query = socket.handshake.query;
  console.log('socket connected', socket.id);

  // New complaint from form
  socket.on('new-complaint', async data => {
    console.log('new-complaint', data);
    try {
      // Create group conversation
      let conv = await circuit.createConversation(supportUserIds, data.name);

      // Create complaint in database
      let newComplaintId = complaints.length ? complaints[complaints.length - 1].complaintId + 1 : config.complaintIdStart;
      let newComplaint = {
        convId: conv.convId,
        complaintId: newComplaintId,
        customer: {
          name: data.name,
          email: data.email,
          topic: data.topic
          
        }
      }

      
      // Post initial message which creates the thread for customer communication
      await circuit.sendMessage(conv.convId, {
        subject: `New complaint: ${newComplaintId}`,
        content: `Name: ${data.name}<br>Email: <a href="${data.email}">${data.email}</a><br>Topic: ${data.topic}<br>`
      });

      // Post initial complaint message. This will become the communication thread with the customer
      const customerThread = await circuit.sendMessage(conv.convId, {
        subject: '*** CUSTOMER COMMUNICATION THREAD ***',
        content: data.message
      });

      // Save threadId in db. Subsequent messages to/from customer go into this thread
      newComplaint.thread = customerThread.itemId;
      complaints.push(newComplaint)
      jsonfile.writeFile(db, complaints, {spaces: 2}, err => {
        if (err) {
          console.error('Error updating the complaint database', err);
          return;
        }
      });
      socket.emit('complaint-created', newComplaintId);

      // Send email to customer
      mailer.sendInitialMsg(newComplaint);

    } catch (err) {
      console.error('Error creating new complaint', err);
    }
  });

  // Get complaint from DB and return to browser
  socket.on('get-complaint', async id => {
    const complaint = complaints.find(c => c.complaintId === id);
    if (!complaint) {
      console.error(`No complaint found in DB for complaint: ${id}`);
      return;
    }
    const messages = await circuit.getMessages(complaint.convId, complaint.thread);
    socket.emit('get-complaint-response', {
      complaint: complaint,
      messages: messages,
    });
  });

  // New message from customer. Post it in public communication thread
  socket.on('new-message', async data => {
    const complaint = complaints.find(c => c.complaintId === data.complaintId);
    if (!complaint) {
      console.error(`No complaint found in DB for complaint: ${data.complaintId}`);
      return;
    }
    await circuit.sendMessage(complaint.convId, {
      parentId: complaint.thread,
      content: data.message
    });
    socket.emit('new-message-response');
  });

  // Look for messages from back office support etc., i.e. for messages in
  // the public communication thread not sent by the customer (bot user)
  // Then update the UI (in case its page it open) and send email to customer.
  emitter.on('message-received', async data => {
    const complaint = complaints.find(c => c.convId === data.convId);
    if (!complaint) {
      console.error(`No complaint found in DB for convId: ${data.convId}`);
      return;
    }
    if (complaint.thread !== data.thread) {
      console.error('Message on a internal thread. Skip it.');
      return;
    }

    if (data.fromCustomer) {
      // Complaint page is already updated locally in browser
      // Might want to send an email to customer letting him/her know
      // that reply was recevied.
      return;
    }

    // Send an event to the UI with the new message and append the new message
    socket.emit('new-support-message', data);

    // Send email to customer notifying of update
    mailer.sendUpdate(complaint, data.message, complaint.complaintId);
  });

});

emitter.on('thread-updated', async data => {

  const complaint = complaints.find(c => c.convId === data.convId);

  if (!complaint) {
    console.error(`No complaint found in DB for convId: ${data.convId}`);
    return;
  }
  
  if (complaint.thread !== data.thread) {
    console.error('Message on a internal thread. Skip it.');
    return;
  }

  if (data.fromCustomer) {
    // Complaint page is already updated locally in browser
    // Might want to send an email to customer letting him/her know
    // that reply was recevied.
    return;
  }

  socket.emit('thread-updated');

});


server.listen(port, _ => console.log(`Server listening at port ${port}`));
