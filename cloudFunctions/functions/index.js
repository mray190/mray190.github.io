const functions = require('firebase-functions');

// https://firebase.google.com/docs/functions/database-events

exports.calculateAvgs = functions.database.ref('/{regional_code}/teams/{team_num}/matches').onWrite((event) => {

  const original = event.data;
  const regional_code = event.params.regional_code;
  const team_num = event.params.team_num;

	var rootRef = original.ref.root;
  var team_average_ref = rootRef.child('/' + regional_code + '/teams/' + team_num + '/averages');
  var raw_results_ref = rootRef.child('/' + regional_code + '/raw_results');
  var team_hash_list =  rootRef.child('/' + regional_code + '/teams/' + team_num + '/matches');
  // Properties that don't get averaged because that would be bad...
  const dont_average = ['auto_start', 'alliance', 'match_num'];

  return raw_results_ref.once('value' , (raw_results_snapshot) => {
    const raw_results = raw_results_snapshot.val();
    var averages = {};
    averages.left_start = 0;
    averages.center_start = 0;
    averages.right_start = 0;

    // Total all of the match data from the hash list
    team_hash_list.once('value', matches_snapshot => {

      var total_num_matches = 0;
      // retrieve each snapshot from the list of matches from the team
      matches_snapshot.forEach((hash_snapshot) => {
        total_num_matches ++;
        const hash = hash_snapshot.val();
        const match = raw_results[hash];
  
        switch(match['auto_start'].toLowerCase()) {
          case('left') : {averages.left_start = (averages.left_start || 0) + 1; break;}
          case('center') : {averages.center_start = (averages.center_start || 0) + 1; break;}
          case('right') : {averages.right_start = (averages.right_start || 0) + 1; break;}
        }   
              
        for(prop in match) {
          if(dont_average.includes(prop.toLowerCase())) continue;
  
          // Create a list of comments instead
          if(prop.toLowerCase() === 'comments') { 
            if(typeof(averages['comments']) === 'undefined') {
              averages['comments'] = []
            } 
            if(match[prop]){
              averages['comments'].push(match[prop]);
            }
          } 
          // Average booleans differently
          else if(typeof(match[prop]) === "boolean") { 
           if(match[prop]) {
             averages[prop] = (averages[prop] || 0.0) + 1.0;
           }
          }
          // Average all other props by their match data totals
          else { 
            averages[prop] = (averages[prop] || 0.0) + parseFloat(match[prop]);
            if(averages[prop + '_max'] < match[prop]) {
              averages[prop + '_max'] = match[prop];
            }
          }
        }
      });

      // Average totals
      const total_hang_attempts = (averages['hang_attempt'] > 0) ? averages['hang_attempt'] : 1;

      for(i in averages) {
        if(i.toLowerCase() === 'comments' || i.includes('_max')) continue;

          // Only average hang attempts based on how many times they attempt
        if(i.toLowerCase() === 'hang_succeed' || i.toLowerCase() === 'host_succeed' || i.toLowerCase() === 'hang_time') {
          averages[i] = (parseFloat(averages[i]) / total_hang_attempts).toFixed(5);
        } else {
          averages[i] = (parseFloat(averages[i]) / total_num_matches).toFixed(5);
        }
      }

      // Upload averages to Firebase
      return team_average_ref.set(averages);
    });
  })
});