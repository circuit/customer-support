# customer-support
Customer complaint system using Circuit for communication

## What it does
1. Customer fills out online complaint form
1. App creates conversation for complaint with back office support, legal team etc.
1. App posts customer information and creates public communication thread with initial compaint message
1. App creates new compaint id and associates it with the conversation and the public communication thead
1. Customer is redirected to just created complaint page and also gets sent an email with the link
1. Company (back office support, legal team etc.) use Circuit with the new conversation for internal discussions
1. At any time support users can post a message to the public thread which is then posted to the customer's complaint page
1. Similarly the customer can post to to the complaint page, and messages are posted to the conversation

## Future enhancements
* Add topic dropdown in form with predefined topics in config
* Allow customer to upload files/images and post them to conversation
* Set conversation avatar (missing in SDK)
* Set a 'complaints' label on conversation

## Run
```bash
  npm install
  npm start
```
