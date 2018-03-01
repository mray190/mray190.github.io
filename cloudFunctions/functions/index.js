const functions = require('firebase-functions');

// https://firebase.google.com/docs/functions/database-events

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.updateTeamInfo = functions.database.ref('/{regional_code}/local/{match}').onWrite((event) => {
  // Grab the current value of what was written to the Realtime Database.
  const original = event.data.val();
  const regional_code = event.params.regional_code;
  const match = event.params.match;
  console.log('Data: ' + original);
  console.log("Code: " + regional_code);
  console.log("Match: " + match);
  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to the Firebase Realtime Database.
  // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  return event.data.ref.parent.child('uppercase').set("hi");
});