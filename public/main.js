
document.addEventListener('DOMContentLoaded', event => {
  const app = document.querySelector('#app');
  const model = {};

  // Connect to server-side app on localhost
  const socket = io();

  // Generic UI handler
  const EventListener = {
    handleEvent: e => model[e.target.name] = e.target.value
  }

  function render() {
    hyperHTML.bind(app)`
      <div class="container">
        <h1>Customer Complaint Form</h1>
        <div>Name: <input required type="text" name="name" onchange="${EventListener.handleEvent}"/></div>
        <div>Email: <input required type="email" name="email" onchange="${EventListener.handleEvent}"/></div>
        <div>Message: <textarea required rows="5" type="text" name="message" onchange="${EventListener.handleEvent}"></textarea></div>
        <button onclick="${createComplaint}">Submit</button>
      </div>`;
  }

  function renderComplaint(data) {
    hyperHTML.bind(app)`
      <div class="container">
        <h1>Customer Complaint</h1>
        <p>Reference Nr. <span id="complaintId">${data.complaint.complaintId}</span><br>
        Customer name: ${data.complaint.customer.name}<br>
        Customer email: ${data.complaint.customer.email}</p>
        ${data.messages.map(m =>
        `<div class="msg msg-${m.fromCustomer ? 'customer' : 'company'}">
          <div class="text">${m.content}</div>
          <div class="date">${new Date(m.timestamp)}</div>
        </div>`)}
        <h4>Post a message:</h4>
        <textarea rows="3" name="message2" onchange="${EventListener.handleEvent}"></textarea>
        <button onclick="${newMessage}">Submit</button>`;
  }

  function createComplaint() {
    console.log(`Submit new complaint for ${model.name}`, model);
    socket.emit('new-complaint', model);
  }

  function newMessage() {
    console.log(`Submit message for complaint ${model.name}`, model);
    socket.emit('new-message', {
      complaintId: Number(document.getElementById('complaintId').innerText),
      message: model.message2
    });
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));
  socket.on('complaint-created', id => location.href = '/?id=' + id);
  socket.on('get-complaint-response', data => renderComplaint(data));
  socket.on('update', data => renderComplaint(data));
  socket.on('new-message-response', () => location.reload());

  if (location.search) {
    // This is a /?id=<complaintId> page, render a complaint
    const id = location.search.substring(location.search.indexOf('id=') + 3)
    socket.emit('get-complaint', Number(id));
  } else {
    // Render main form
    render();
  }
});
