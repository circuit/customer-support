
document.addEventListener('DOMContentLoaded', event => {
  const app = document.querySelector('#app');
  let model = {};

  // Connect to server-side app on localhost
  const socket = io();

  // Generic UI handler
  const EventListener = {
    handleEvent: e => model[e.target.name] = e.target.value
  }

  function renderComplaint() {
    hyperHTML.bind(app)`
      <div class="container" id = "inner">
        <h1>Customer Complaint</h1>
        <p id = "innerp">Reference Number: <b><span id="complaintId">${model.complaint.complaintId}</span></b><br>
        Customer name: <b>${model.complaint.customer.name}</b><br>
        Customer email: <b>${model.complaint.customer.email}</b><br>
        Topic: <b>${model.complaint.customer.topic}</b></p>
        ${model.messages.map(m =>
        `<div id="section" class="msg msg-${m.fromCustomer ? 'customer' : 'company'}">
          <div><em id = "${m.fromCustomer ? 'nul' : 'supp'}"><small>${m.fromCustomer ? 'You' : 'Support'}:</small></em><div class = "chat"><div class= "${m.fromCustomer ? "textC" : "textS"}">${m.content}<small></div><div class= ${m.fromCustomer ? "dateC" : "dateS"}>${moment(m.timestamp).format('llll')}</div></small>
        `)} <br>
        <textarea cols="60" rows="3" id = "txt" name="message" onchange="${EventListener.handleEvent}" placeholder="Enter a message"></textarea>
        <div><button type="button" class="btn btn-primary" onclick="${newMessage}">Submit</button></div><br>
      </div>`;
  }

  function newMessage() {
    if (!model.message) {
      return;
    }

    console.log(`Submit message for complaint ${model.name}`, model);
    socket.emit('new-message', {
      complaintId: Number(document.getElementById('complaintId').innerText),
      message: model.message
    });

    model.messages.push({
      fromCustomer: true,
      content: model.message,
      timestamp: Date.now()
    });
    renderComplaint();

    document.querySelector('textarea[name="message"]').value = '';
    model.message = '';
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));

  // Render complaint page after getting its data from server
  socket.on('get-complaint-response', data => {
    model = data;
    renderComplaint();
  });

  socket.on('new-support-message', data => {
    model.messages.push({
      fromCustomer: false,
      content: data.message,
      timestamp: Date.now()
    });
    renderComplaint();
  });

  socket.on('thread-updated', () => {
   socket.emit('get-complaint', Number(id));
  });

  const id = location.search.substring(location.search.indexOf('id=') + 3)
  socket.emit('get-complaint', Number(id));
});
