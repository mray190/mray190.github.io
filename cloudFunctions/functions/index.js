const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
admin.initializeApp();

// https://firebase.google.com/docs/functions/database-events

exports.calculateAvgs = functions.database.ref('/{regional_code}/teams/{team_num}/matches').onWrite((event) => {
  if(event.eventType === 'providers/google.firebase.database/eventTypes/ref.delete') return;

  const original = event.data;
  const regional_code = event.params.regional_code;
  const team_num = event.params.team_num;

  const root_ref = original.ref.root;
  var team_average_ref = root_ref.child('/' + regional_code + '/teams/' + team_num + '/averages');
  var raw_results_ref =  root_ref.child('/' + regional_code + '/raw_results');
  var team_hash_list =  root_ref.child('/' + regional_code + '/teams/' + team_num + '/matches');
  // Properties that don't get averaged because that would be bad...
  const dont_average = ['auto_start', 'alliance', 'match_num', 'team_num', 'auto_switch', 'auto_scale'];
  console.log('RREF: ' + raw_results_ref);

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

        if(!match) {
          console.error('Unable to find match hash: ' + hash + ' for team: ' + team_num);
          return;
        }
  
        switch(match['auto_start'].toLowerCase()) {
          case('left') : {
            averages.left_start = (averages.left_start || 0) + 1; 
            averages.auto_left_switch = (averages.auto_left_switch || 0) + (match.auto_switch || 0);          
            averages.auto_left_scale = (averages.auto_left_scale || 0) + (match.auto_scale || 0); break;          
          }
          case('center') : {
            averages.center_start = (averages.center_start || 0) + 1;
            averages.auto_center_switch = (averages.auto_center_switch || 0) + (match.auto_switch || 0);
            averages.auto_center_scale = (averages.auto_center_scale || 0) + (match.auto_scale || 0); break;
          }
          case('right') : {
            averages.right_start = (averages.right_start || 0) + 1;
            averages.auto_right_switch = (averages.auto_right_switch || 0) + (match.auto_switch || 0);
            averages.auto_right_scale = (averages.auto_right_scale || 0) + (match.auto_scale || 0); break;
          }
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
           } else {
            averages[prop] = (averages[prop] || 0.0);
           }
          }
          // Average all other props by their match data totals
          else { 
            averages[prop] = (parseFloat(averages[prop]) || 0.0) + parseFloat(match[prop]);
            if(averages[prop + '_max'] < match[prop] || !(averages[prop + '_max'])) {
              averages[prop + '_max'] = parseFloat(match[prop]);
            }

            if(prop === 'hang_time' && match['hang_attempt']) {
              if((match[prop] < averages[prop + '_min'] && match[prop] > 0) || !(averages[prop + '_min'])) {
                averages[prop + '_min'] = parseFloat(match[prop]);
              }
            }
          }
        }
      });

      // Average totals
      const total_hang_attempts = (averages['hang_attempt'] > 0) ? averages['hang_attempt'] : 1;

      const total_auto_left = (averages['left_start'] > 0) ? averages['left_start'] : 1;
      const total_auto_center = (averages['center_start'] > 0) ? averages['center_start'] : 1;
      const total_auto_right = (averages['right_start'] > 0) ? averages['right_start'] : 1;


      for(i in averages) {
        if(i.toLowerCase() === 'comments' || i.includes('_max') || i.includes('_min')) continue;

        var divisor = total_num_matches;
        switch(i) {
          case 'auto_left_switch': 
          case 'auto_left_scale': {divisor = total_auto_left; break;}

          case 'auto_center_switch': 
          case 'auto_center_scale': {divisor = total_auto_center; break;}

          case 'auto_right_switch': 
          case 'auto_right_scale': {divisor = total_auto_right; break;}

          case 'hang_succeed':
          case 'host_succeed':
          case 'hang_time': {divisor = total_hang_attempts; break;}
          
          default: {divisor = total_num_matches; break;}
        }

        averages[i] = parseFloat((parseFloat(averages[i]) / divisor).toFixed(5));
      }
      // Upload averages to Firebase
      return team_average_ref.set(averages);
    });
  })
});
