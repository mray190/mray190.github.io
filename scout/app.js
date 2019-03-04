var TBA = require('./src/tba.js');
var tba = new TBA();

// Year + 4 digit event code
var eventCode = "2019miket";
// Team codes have "frc" in front of the number
var teamCode = "frc27";

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

var events = [
    '2019qcmo',
    '2019scmb',
    '2019caoc',
    '2019migib',
    '2019miket',
    '2019misou',
    '2019nhgrs',
    '2019cadm',
    '2019gagai',
    '2019onosh',
    '2019pahat',
    '2019vagle',
    '2019vahay',
    '2019txaus',
    '2019txelp',
    '2019wamou',
    '2019tuis',
    '2019isde1'
];

for (var event in events) {
    tba.genCSV(events[event]);
}