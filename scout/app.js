var TBA = require('./src/tba.js');
var tba = new TBA();

// Year + 4 digit event code
// var eventCode = "2019miket";
// Team codes have "frc" in front of the number
// var teamCode = "frc27";

/*
// Team Information
// Inspect the stats of the last match a team plays
tba.getTeamLastMatch(eventCode, teamCode, function(last_match) {
    console.log(last_match);
});

// Get the match to assemble prescouting info for the next match we play in
tba.getTeamNextMatch(eventCode, teamCode, function(next_match) {
    console.log(next_match);
});

// Identify if a team has been picked in real-time during scouting
// NULL if not picked
tba.getTeamAlliance(eventCode, teamCode, function(alliance) {
    console.log(alliance);
});

// Rank is a must-know piece of info at all times (for all teams)
tba.getTeamRank(eventCode, teamCode, function(rank) {
    console.log(rank);
});

// Event Information
// Get a team list for an event
tba.getTeams(eventCode, function(teams) {
    console.log(teams);
});

// Get a match list for an event
tba.getMatches(eventCode, function(matches) {
    console.log(matches);
});

// Get the latest OPR stats for an event
tba.getOPRs(eventCode, function(oprs) {
    console.log(oprs);
});

// Get the last match played at an event
// NULL if all completed
tba.getLastMatch(eventCode, function(last_match) {
    console.log(last_match);
});

// Get the next match to be played at an event
tba.getNextMatch(eventCode, function(last_match) {
    console.log(last_match);
});
*/

// var cache = {};
// var results = {};
// tba.getTeams('2019gal', function(teams) {
//     for (var team in teams) {
//             tba.getOverallTeamLastMatch(teams[team], function(last_match) {
//                 if (!(last_match.event_key in cache)) {
//                     var that = { team: this.team, event: last_match.event_key };
//                     tba.genOPRs(last_match.event_key, function(oprs) {
//                         cache[this.event] = oprs;
//                         results[this.team] = { avgs: oprs[this.team] };
//                         tba.genCSV(results, '2019gal_prescout');
//                     }.bind(that));
//                 } else {
//                     results[this.team] = { avgs: cache[last_match.event_key][this.team] };
//                     tba.genCSV(results, '2019gal_prescout');
//                 }
//             }.bind({team: teams[team].replace('frc','')}));
//     }
// })


tba.genOPRs('2020isde1', function(oprs) {
    // cache[this.event] = oprs;
    // results[this.team] = { avgs: oprs[this.team] };
    // tba.genCSV(results, '2019txpas_prescout_elims');
}, true);