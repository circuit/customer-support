
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
      <div class="container" id = "inner">
        <form>
          <div id="formHead">
            <h1>Customer Complaint Form</h1>
            <p>Please fill out your customer information below.</p>
          </div>
          <div class="form-group">
            <label for="name" id="headings">Name: </label>
            <input required type="text" class="form-control" id="name" name="name" placeholder="John Smith" onchange="${EventListener.handleEvent}">
          </div>
          <div class="form-group">
            <label for="email" id="headings">Email: </label>
            <input required type="email" class="form-control" id="email" placeholder="johnsmith123@gmail.com" name="email" onchange="${EventListener.handleEvent}">
          </div>
          <div class="form-group">
            <label for="sel1" id="headings">Select an Issue: </label>
            <select class="form-control" id="topic" name ="topic" onchange="${EventListener.handleEvent}">
              <option>Select</option>
              <option value = "Washing Machine">Washing Machine</option>
              <option value = Dryer>Dryer</option>
              <option value = Fridge>Fridge</option>
              <option value = Dishwasher>Dishwasher</option>
              <option value = Misc>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="message" id="headings">Message: </label>
            <textarea class="form-control" required rows="5" placeholder="Please provide any relevant information here..." type="text" id="message" name="message" onchange="${EventListener.handleEvent}"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" onclick="${createComplaint}">Submit</button>
        </form>
      </div>`;
  }

  function createComplaint(e) {
<<<<<<< HEAD

    if(model.name == undefined || model.email == undefined || model.topic == undefined || model.message == undefined){
  
      let resp = "";

      if(model.name == undefined){
        resp+="**Name** is empty, please fill in your name. \n\n";
      }
      if(model.email == undefined){
        resp+="**Email** is empty, please fill in your email adress. \n\n";
      }
      if(model.topic == undefined){
        resp+="**Issue** You did not select a relevant issue, please select **other** if you're having a different problem not listed.\n\n";
      }
      if(model.message == undefined){
        resp+="**Message** Please fill out a message decribing your issue.\n\n";
      }

=======
    e.preventDefault();

    if (!model.name || !model.email || !model.topic || !model.message) {
      let resp = '';
      !model.name && (resp += 'Please fill in your name. \n\n');
      !model.email && (resp += 'Please fill in your email adress. \n\n');
      !model.topic && (resp += `You did not select a relevant issue, please select **other** if you're having a different problem not listed.\n\n`);
      !model.message && (resp += 'Please fill out a message decribing your issue.\n\n');
>>>>>>> e707d85aa52167100430da7f0f9237421af08b6e
      alert(resp);
      return;
    }

    console.log(`Submit new complaint for ${model.name}`, model);
    socket.emit('new-complaint', model);
  }

  socket.on('disconnect', () => console.error('Socket has disconnected'));

  // New complaint created, navigate to its page
  socket.on('complaint-created', id => location.href = '/complaint?id=' + id);

  socket.on('update', data => renderComplaint(data));

  render();
});
