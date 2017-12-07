
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

  function renderComplaint(id) {
    hyperHTML.bind(app)`
      <div class="container">
        <h1>Customer Complaint ${id}</h1>

      </div>`;
  }

  function send() {
    console.log(`Submit message for ${model.name}`, model);
    socket.emit('new-complaint', model)
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));

  socket.on('complaint-created', id => location.href = '/?id=' + id);

  // TODO: check if this is a /#<complaintId> page, and if so render a cmplaint
  // with renderComplaint instead
  if (location.search) {
    renderComplaint(location.search.substring(4));
  } else {
    render();
  }
});
