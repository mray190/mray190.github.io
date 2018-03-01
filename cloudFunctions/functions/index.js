const functions = require('firebase-functions');

// https://firebase.google.com/docs/functions/database-events

exports.calculateAvgs = functions.database.ref('/{regional_code}/teams/{team_num}/matches/{match_uid}').onWrite((event) => {

	const original = event.data;
	const regional_code = event.params.regional_code;
	const team_num = event.params.team_num;
  const match_num = event.params.match_uid;
  const match_data = event.data.val();

	var rootRef = original.ref.root;
  var averageRef = rootRef.child('/'+regional_code+'/teams/' + team_num + '/averages');
  var matchesRef = rootRef.child('/'+regional_code+'/teams/' + team_num + '/matches');
  
  return matchesRef.once('value',(matches_snapshot) => {
    return averageRef.once('value', (average_snapshot) => {
      var current_averages = average_snapshot.val()
      if(!current_averages) current_averages = {}
      const total_num_matches = matches_snapshot.numChildren();
  
      current_averages.total_matches = (total_num_matches || 1);

      // AUTO STARTING POSITIONS
      switch(match_data.auto_start.toLowerCase()) {
        case('left') : {current_averages.left_total = (current_averages.left_total || 0) + 1; break;}
        case('center') : {current_averages.center_total = (current_averages.center_total || 0) + 1; break;}
        case('right') : {current_averages.right_total = (current_averages.right_total || 0) + 1; break;}
        default: break;
      }
      current_averages.left_avg = (current_averages.left_total || 0) / total_num_matches;
      current_averages.center_avg = (current_averages.center_total || 0) / total_num_matches;
      current_averages.right_avg = (current_averages.right_total || 0) / total_num_matches;

      var props = ['auto_scale', 'auto_switch', 'teleop_scale', 'teleop_switch', 'teleop_vault']
      props.forEach((prop)=>{
        current_averages[prop + '_total'] = (current_averages[prop + '_total'] || 0) + match_data[prop];
        current_averages[prop + '_avg'] = (current_averages[prop + '_avg'] || 0) / total_num_matches;
        if(match_data[prop] > current_averages[prop + '_max']) {current_averages[prop + '_max'] = match_data[prop]}
      })

      var prop_bools = ['auto_line', 'hang_attempt', 'hang_succeed', 'hang_host']
      prop_bools.forEach((prop_bool) =>{
        current_averages[prop_bool + '_total'] = (current_averages[prop_bool + '_total'] || 0) + (match_data[prop_bool] ? 1 : 0);
        if(prop_bool === prop_bools[0] || prop_bool === prop_bools[1]) {
          current_averages[prop_bool + '_avg'] = (current_averages[prop_bool + '_total'] || 0) / total_num_matches;
        } else {
          current_averages[prop_bool + '_avg'] = (current_averages[prop_bool + '_total'] || 0) / (current_averages.teleop_hang_attempt_total || 1);
        }
      })

      current_averages.teleop_hang_time_total = (current_averages.teleop_hang_time_total || 0) + match_data.hang_time;
      current_averages.teleop_hang_time_avg = (current_averages.teleop_hang_time_total || 0) / current_averages.teleop_hang_succeed_total;

      return averageRef.set(current_averages);
    })
  })
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