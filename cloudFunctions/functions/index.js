const functions = require('firebase-functions');

// https://firebase.google.com/docs/functions/database-events

exports.calculateAvgs = functions.database.ref('/{regional_code}/teams/{team_num}/matches/{match_num}').onWrite((event) => {

	const original = event.data;
	const regional_code = event.params.regional_code;
	const team_num = event.params.team_num;
	const match_num = event.params.match_num;

	var collectionRef = original.ref.parent;
	var averageRef = collectionRef.parent.child("averages");

	return averageRef.transaction(function(current) {
		console.log("Curent: " + current);
		current.matches = (current.matches || 0) + 1;
		return current;
	});

	// Auto center %
	// Auto right %
	// Auto left %
	// Auto max scale
	// Auto scale
	// Auto max switch
	// Auto switch
	// Auto line cross %
	// Max switch
	// Avg switch
	// Max scale
	// Avg scale
	// Max vault
	// Avg vault
	// Hang attempts
	// Hang %
	// Host hangs
	// Host hang %
});