
document.addEventListener('DOMContentLoaded', event => {
  const app = document.querySelector('#app');
  const model = {};

  // Connect to server-side app on localhost
  const socket = io();

  // Generic UI handler
  const EventListener = {
    handleEvent: e => model[e.target.name] = e.target.value
  }

  // Render whole page in one shot since its so small
  function render() {
    hyperHTML.bind(app)`
      <div class="container">
        <h1>Customer Complaint Form</h1>
        <div>Name: <input required type="text" name="name" onchange="${EventListener.handleEvent}"/></div>
        <div>Email: <input required type="email" name="email" onchange="${EventListener.handleEvent}"/></div>
        <div>Message: <textarea required rows="5" type="text" name="message" onchange="${EventListener.handleEvent}"></textarea></div>
        <button onclick="${send}">Submit</button>
      </div>`;
  }

  function renderComplaint(data) {
    hyperHTML.bind(app)`
      <div class="container">
        <h1>Customer Complaint</h1>
        <p>Reference Nr. ${data.id}</p>
        <p>Customer name: ${data.name}</p>
        <p>Customer email: ${data.email}</p>
        <ul>
          <li>todo messages</li>
        </ul>
      </div>`;
  }

  function send() {
    console.log(`Submit message for ${model.name}`, model);
    socket.emit('new-complaint', model);
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));

  socket.on('complaint-created', id => location.href = '/?id=' + id);

  socket.on('get-complaint-response', data => {
    renderComplaint(data);
  });

  // Check if this is a /?id=<complaintId> page, and if so render a cmplaint
  if (location.search) {
    // Lookup public communication thread from conversation in circuit and
    // display on page together with an input field for customer to post
    // more information.
    const id = location.search.indexOf('id=') + 3;
    socket.emit('get-complaint', id);
  } else {
    // Render main form
    render();
  }
});
