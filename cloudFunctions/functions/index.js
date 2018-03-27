const functions = require('firebase-functions');

// https://firebase.google.com/docs/functions/database-events

exports.calculateAvgs = functions.database.ref('/{regional_code}/teams/{team_num}/matches').onWrite((event) => {

  const team_hash_list = event.data.val();
  const total_num_matches = (team_hash_list.length > 0 ? team_hash_list.length : 1);
  const regional_code = event.params.regional_code;
  const team_num = event.params.team_num;

	const root_ref = original.ref.root;
  const team_average_ref = rootRef.child('/' + regional_code + '/teams/' + team_num + '/averages');
  const raw_results_ref = rootRef.child('/' + regional_code + '/raw_results');

  // Properties that don't get averaged because that would be bad...
  const dont_average = ['auto_start', 'alliance', 'match_num'];

  return raw_results_ref.once('value',(raw_results_snapshot) => {
    const raw_results = raw_results_snapshot.val();
    var averages = {};
    averages.left_start = 0;
    averages.center_start = 0;
    averages.right_start = 0;

    // Total all of the match data from the hash list
    team_hash_list.forEach(hash => {
      console.log('Team:' + team_num + ' Hash:' + hash)
      const match = raw_results[hash];

      switch(match['auto_start'].toLowerCase()) {
        case('left') : {averages.left_start = (averages.left_start || 0) + 1; break;}
        case('center') : {averages.center_start = (averages.center_start || 0) + 1; break;}
        case('right') : {averages.right_start = (averages.right_start || 0) + 1; break;}
      }   
            
      for(prop in match) {
        if(dont_average.contains(prop.toLowerCase())) continue;

        // Create a list of comments instead
        if(prop.toLowerCase() === 'comments') { 
          averages[prop] = (averages[prop] || []).push(match[prop]);
        } 
        // Average booleans differently
        else if(typeof(match[prop]) === "boolean") { 
         if(match[prop]) {
           averages[prop] = (averages[prop] || 0.0) + 1.0;
         }
        } 
        // Average all other props by their match data totals
        else { 
          averages[prop] = (averages[prop] || 0.0) + match[prop];
        }
      }
    });

    // Average totals
    const total_hang_attempts = averages['hang_attempt'];
    for(i in averages) {
      
        // Only average hang attempts based on how many times they attempt
      if(i.toLowerCase() === 'hang_succeed' || i.toLowerCase() === 'host_succeed' || i.toLowerCase() === 'hang_time') {
        averages[i] = parseFloat(averages[i]) / total_hang_attempts;
      } else {
        averages[i] = parseFloat(averages[i]) / total_num_matches;
      }
    }

    // Upload averages to Firebase
    return team_average_ref.set(averages);
  })
});