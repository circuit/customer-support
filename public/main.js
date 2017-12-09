
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
        <h2>Customer Complaint Form</h2>
        <form>
          <div class="form-group">
            <label for="name">Name</label>
            <input required type="text" class="form-control" id="name" name="name" onchange="${EventListener.handleEvent}">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input required type="email" class="form-control" id="email" name="email" onchange="${EventListener.handleEvent}">
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea class="form-control" required rows="5" type="text" id="message" name="message" onchange="${EventListener.handleEvent}"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" onclick="${createComplaint}">Submit</button>
        </form>
      </div>`;
  }

  function createComplaint(e) {
    e.preventDefault();
    console.log(`Submit new complaint for ${model.name}`, model);
    socket.emit('new-complaint', model);
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));

  // New complaint created, navigate to its page
  socket.on('complaint-created', id =>
    location.href = '/complaint?id=' + id);

  socket.on('update', data => renderComplaint(data));

  render();
});
