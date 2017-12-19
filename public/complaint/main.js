
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
        <h2>Customer Complaint</h2>
        <p>Reference Number: <span id="complaintId">${model.complaint.complaintId}</span><br>
        Customer name: ${model.complaint.customer.name}<br>
        Customer email: ${model.complaint.customer.email}</p>
        ${model.messages.map(m =>
        `<div id="section" class="msg msg-${m.fromCustomer ? 'customer' : 'company'}">
          <div class= "${m.fromCustomer ? "textC" : "textS"}"><em>${m.fromCustomer ? 'You' : 'Support'}: </em>${m.content}<small><div class="date">${moment(m.timestamp).format('llll')}</div></small></div>
        </div>`)} <br>
        <textarea cols="60" rows="3" id = "txt" name="message" onchange="${EventListener.handleEvent}" placeholder="Enter message"></textarea>
        <div><button type="button" class="btn btn-primary" onclick="${newMessage}">Submit</button></div>
      </div>`;
  }

  function newMessage() {
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


  socket.on();

  const id = location.search.substring(location.search.indexOf('id=') + 3)
  socket.emit('get-complaint', Number(id));
});
