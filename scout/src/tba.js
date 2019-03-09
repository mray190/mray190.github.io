'use strict';

(function() {
    var root = this;

    var has_require = typeof require !== 'undefined';
    var request = root.request;
    if (typeof request === 'undefined') {
        if (has_require) {
            request = require('request');
        } else {
            throw new Error('Requires request');
        }
    }
    var math = root.math;
    if (typeof math === 'undefined') {
        if (has_require) {
            math = require('mathjs');
        } else {
            throw new Error('Requires math');
        }
    }

    class TBA {

        constructor()
        {
            this.apiKey = 'LCBZ7qqYrBR0e06C4QJEjaW1O7r2TZat7KZwvQcfDqShwIxV4N7epHK9lbafjc4M';
            this.baseURL = 'https://www.thebluealliance.com/api/v3';
        }

        httpGet(url, callback)
        {
            var options = {
                method: 'GET',
                url: this.baseURL + url,
                headers: {
                    'X-TBA-Auth-Key': this.apiKey
                }
            };
            request(options, function (error, response, body) {
                if (error) console.log(error);
                callback(JSON.parse(body));
            });
        }

        getRegionals(callback)
        {
            this.httpGet('/events/2019', callback);
        }

        // Event information

        getTeams(code, callback)
        {
            this.httpGet('/event/' + code + '/teams/keys', callback);
        }

        getMatch(match_code, callback)
        {
            this.httpGet('/match/' + match_code, callback);
        }

        getMatches(code, callback)
        {
            this.httpGet('/event/' + code + '/matches', callback);
        }

        getOPRs(code, callback)
        {
            this.httpGet('/event/' + code + '/oprs', function(stats) {
                callback(stats.oprs);
            });
        }

        getLastMatch(code, callback)
        {
            this.getMatches(code, function(matches) {
                // Remove matches that haven't happened yet
                for (var match in matches) {
                    if (matches[match].comp_level == null) {
                        delete matches[match];
                    }
                }
                // Cleanse array of null objects
                var cleaned = matches.filter(function (el) {
                    return el != null;
                });
                // Sort by timestamp
                cleaned.sort(function(first, second) {
                  return second.post_result_time - first.post_result_time;
                });
                // Get latest match
                callback(cleaned[0]);
            });
        }

        getNextMatch(code, callback)
        {
            this.getMatches(code, function(matches) {
                for (var match in matches) {
                    if (matches[match].actual_time != null) {
                        delete matches[match];
                    }
                }
                var cleaned = matches.filter(function (el) {
                    return el != null;
                });
                // Sort by timestamp
                cleaned.sort(function(first, second) {
                  return first.post_result_time - second.post_result_time;
                });
                // Get next match
                callback(cleaned[0]);
            });
        }

        // Team information

        getTeamStatus(code, team_code, callback)
        {
            this.httpGet('/team/' + team_code + '/event/' + code + '/status', callback);
        }

        getTeamEvents(team_code, callback)
        {
            this.httpGet('/team/' + team_code + '/events/2019/statuses', callback);
        }

        getOverallTeamNextMatch(team_code, callback)
        {
            var that = this;
            that.getTeamEvents(team_code, function (events) {
                for (var event in events) {
                    if (events[event]) {
                        if (events[event].next_match_key) {
                            that.getMatch(events[event].next_match_key, callback);
                            return;
                        }
                    }
                }
                callback(null);
            });
        }

        getOverallTeamLastMatch(team_code, callback)
        {
            var that = this;
            that.getTeamEvents(team_code, function (events) {
                for (var event in events) {
                    if (events[event]) {
                        if (events[event].last_match_key) {
                            that.getMatch(events[event].last_match_key, callback);
                            return;
                        }
                    }
                }
                callback(null);
            });
        }

        getTeamLastMatch(code, team_code, callback)
        {
            var that = this;
            that.getTeamStatus(code, team_code, function(status) {
                that.getMatch(status.last_match_key, callback);
            });
        }

        getTeamNextMatch(code, team_code, callback)
        {
            var that = this;
            that.getTeamStatus(code, team_code, function(status) {
                that.getMatch(status.next_match_key, callback);
            });
        }

        getTeamAlliance(code, team_code, callback)
        {
            this.getTeamStatus(code, team_code, function(status) {
                callback(status.alliance);
            });
        }

        getTeamRank(code, team_code, callback)
        {
            this.getTeamStatus(code, team_code, function(status) {
                callback(status.qual.ranking.rank);
            });
        }

        parseMatch(complete_match_data)
        {
            var match = complete_match_data.score_breakdown;

            var colors = ['blue', 'red'];

            var low_rocket = [
                                'lowLeftRocketFar',
                                'lowRightRocketFar',
                                'lowLeftRocketNear',
                                'lowRightRocketNear',
                            ];
            var mid_rocket = [
                                'midLeftRocketFar',
                                'midRightRocketFar',
                                'midLeftRocketNear',
                                'midRightRocketNear',
                            ];
            var high_rocket = [
                                'topLeftRocketFar',
                                'topRightRocketFar',
                                'topLeftRocketNear',
                                'topRightRocketNear',
                            ];

            var results = {};

            for (var color in colors) {

                var cargo_side_panels = 0;
                var cargo_side_cargo = 0;
                var cargo_front_panels = 0;
                var cargo_front_cargo = 0;

                for (var i = 1; i <= 8; i++) {

                    var bay = match[colors[color]]['bay' + i].replace('And', '');
                    var scored_bay = bay.replace(match[colors[color]]['preMatchBay' + i], '');

                    if (scored_bay.includes('Cargo')) {
                        if (i == 4 || i == 5)
                            cargo_front_cargo++;
                        else
                            cargo_side_cargo++;
                    }
                    if (scored_bay.includes('Panel')) {
                        if (i == 4 || i == 5)
                            cargo_front_panels++;
                        else
                            cargo_side_panels++;
                    }
                }

                var rocket_high_panels = 0;
                var rocket_mid_panels = 0;
                var rocket_low_panels = 0;

                var rocket_high_cargo = 0;
                var rocket_mid_cargo = 0;
                var rocket_low_cargo = 0;

                for (var i = 0; i < 4; i++) {
                    var top = match[colors[color]][high_rocket[i]].replace('And', '');
                    if (top.includes('Cargo'))
                        rocket_high_cargo++;
                    if (top.includes('Panel'))
                        rocket_high_panels++;
                    var mid = match[colors[color]][mid_rocket[i]].replace('And', '');
                    if (mid.includes('Cargo'))
                        rocket_mid_cargo++;
                    if (mid.includes('Panel'))
                        rocket_mid_panels++;
                    var low = match[colors[color]][low_rocket[i]].replace('And', '');
                    if (low.includes('Cargo'))
                        rocket_low_cargo++;
                    if (low.includes('Panel'))
                        rocket_low_panels++;
                }

                for (var i = 1; i <= 3; i++) {
                    var robot_start = parseInt(match[colors[color]]['preMatchLevelRobot' + i].replace('HabLevel', ''));
                    var robot_climb = parseInt(match[colors[color]]['endgameRobot' + i].replace('HabLevel', ''));
                    var robot_auto_move = match[colors[color]]['habLineRobot' + i] == 'CrossedHabLineInSandstorm';
                
                    var robot = parseInt(complete_match_data.alliances[colors[color]].team_keys[i-1].replace('frc', ''));
                    results[robot] = {
                        'cargo_side_panels': cargo_side_panels,
                        'cargo_side_cargo': cargo_side_cargo,
                        'cargo_front_panels': cargo_front_panels,
                        'cargo_front_cargo': cargo_front_cargo,
                        'rocket_high_panels': rocket_high_panels,
                        'rocket_high_cargo': rocket_high_cargo,
                        'rocket_mid_cargo': rocket_mid_cargo,
                        'rocket_mid_panels': rocket_mid_panels,
                        'rocket_low_panels': rocket_low_panels,
                        'rocket_low_cargo': rocket_low_cargo,
                        'level_start': robot_start,
                        'level_climb': robot_climb,
                        'auto_move': robot_auto_move,
                        'teams_played_with': [
                            parseInt(complete_match_data.alliances[colors[color]].team_keys[0].replace('frc', '')),
                            parseInt(complete_match_data.alliances[colors[color]].team_keys[1].replace('frc', '')),
                            parseInt(complete_match_data.alliances[colors[color]].team_keys[2].replace('frc', ''))
                        ]
                    }

                }
            }
            return results;
        }

        countInArray(array, value) {
            return array.reduce((n, x) => n + (x === value), 0);
        }

        genCSV(eventCode)
        {
            this.genOPRs(eventCode, function(results) {
                var output = 'Team,OPR,' +
                    'Cargo Side (Panel),' +
                    'Cargo Side (Cargo),' +
                    'Cargo Front (Panel),' +
                    'Cargo Front (Cargo),' +
                    'Rocket High (Panel),' +
                    'Rocket High (Cargo),' +
                    'Rocket Mid (Panel),' +
                    'Rocket Mid (Cargo),' +
                    'Rocket Low (Panel),' +
                    'Rocket Low (Cargo),' +
                    'Starting Avg,' +
                    'Climbing Avg\n';
                for (var team in results) {
                    output += team + ',' +
                        results[team].opr.toFixed(3) + ',' +
                        results[team].cargo_side_panel_opr.toFixed(3) + ',' +
                        results[team].cargo_side_cargo_opr.toFixed(3) + ',' +
                        results[team].cargo_front_panel_opr.toFixed(3) + ',' +
                        results[team].cargo_front_cargo_opr.toFixed(3) + ',' +
                        results[team].rocket_high_panel_opr.toFixed(3) + ',' +
                        results[team].rocket_high_cargo_opr.toFixed(3) + ',' +
                        results[team].rocket_mid_panel_opr.toFixed(3) + ',' +
                        results[team].rocket_mid_cargo_opr.toFixed(3) + ',' +
                        results[team].rocket_low_panel_opr.toFixed(3) + ',' +
                        results[team].rocket_low_cargo_opr.toFixed(3) + ',' +
                        results[team].start_avg.toFixed(3) + ',' +
                        results[team].climb_avg.toFixed(3) + '\n';
                }
                // fs.writeFile('./results/' + eventCode + '.csv', output, function(err) {
                //     if(err) console.log(err);
                // });
            });
        }

        genOPRs(eventCode, callback)
        {
            var that = this;
            var results = {};
            this.getMatches(eventCode, function(matches) {
                if (matches.length == 0) {
                    callback(null);
                    return null;
                }
                for (var match in matches) {
                    if (matches[match].actual_time && matches[match].comp_level === 'qm') {
                        var parsed_match = that.parseMatch(matches[match]);
                        for (var team in parsed_match) {

                            // Initialize entrys
                            if (!(team in results)) {
                                results[team] = {
                                    'matches': 0,
                                    'cargo_side_panel_sum': 0,
                                    'cargo_side_cargo_sum': 0,
                                    'cargo_front_panel_sum': 0,
                                    'cargo_front_cargo_sum': 0,
                                    'rocket_high_panel_sum': 0,
                                    'rocket_high_cargo_sum': 0,
                                    'rocket_mid_panel_sum': 0,
                                    'rocket_mid_cargo_sum': 0,
                                    'rocket_low_panel_sum': 0,
                                    'rocket_low_cargo_sum': 0,
                                    'start_level_2_sum': 0,
                                    'start_level_1_sum': 0,
                                    'climb_level_3_sum': 0,
                                    'climb_level_2_sum': 0,
                                    'climb_level_1_sum': 0,
                                    'teams_played_with': []
                                };
                            }

                            // Fill sum table
                            results[team].matches += 1;
                            results[team].cargo_side_panel_sum += parsed_match[team].cargo_side_panels;
                            results[team].cargo_side_cargo_sum += parsed_match[team].cargo_side_cargo;
                            results[team].cargo_front_panel_sum += parsed_match[team].cargo_front_panels;
                            results[team].cargo_front_cargo_sum += parsed_match[team].cargo_front_cargo;
                            results[team].rocket_high_panel_sum += parsed_match[team].rocket_high_panels;
                            results[team].rocket_high_cargo_sum += parsed_match[team].rocket_high_cargo;
                            results[team].rocket_mid_panel_sum += parsed_match[team].rocket_mid_panels;
                            results[team].rocket_mid_cargo_sum += parsed_match[team].rocket_mid_cargo;
                            results[team].rocket_low_panel_sum += parsed_match[team].rocket_low_panels;
                            results[team].rocket_low_cargo_sum += parsed_match[team].rocket_low_cargo;
                            results[team].start_level_2_sum += (parsed_match[team].level_start == 2) && (parsed_match[team].auto_move == 1);
                            results[team].start_level_1_sum += (parsed_match[team].level_start == 1) && (parsed_match[team].auto_move == 1);
                            results[team].climb_level_3_sum += parsed_match[team].level_climb == 3;
                            results[team].climb_level_2_sum += parsed_match[team].level_climb == 2;
                            results[team].climb_level_1_sum += parsed_match[team].level_climb == 1;
                            results[team].teams_played_with = results[team].teams_played_with.concat(parsed_match[team].teams_played_with);

                        }

                    }
                }

                // Formulate team playing with team array
                var A = [];

                var cargo_side_panel_sums = [];
                var cargo_side_cargo_sums = [];
                var cargo_front_panel_sums = [];
                var cargo_front_cargo_sums = [];
                var rocket_high_panel_sums = [];
                var rocket_high_cargo_sums = [];
                var rocket_mid_panel_sums = [];
                var rocket_mid_cargo_sums = [];
                var rocket_low_panel_sums = [];
                var rocket_low_cargo_sums = [];
                var climb_avgs = [];
                var start_avgs = [];

                for (var team in results) {
                    var row = [];
                    for (var comparing_team in results) {
                        row.push(that.countInArray(results[comparing_team].teams_played_with, parseInt(team)));
                    }
                    A.push(row);
                    cargo_side_panel_sums.push(results[team].cargo_side_panel_sum * 2);
                    cargo_side_cargo_sums.push(results[team].cargo_side_cargo_sum * 3);
                    cargo_front_panel_sums.push(results[team].cargo_front_panel_sum * 2);
                    cargo_front_cargo_sums.push(results[team].cargo_front_cargo_sum * 3);
                    rocket_high_panel_sums.push(results[team].rocket_high_panel_sum * 2);
                    rocket_high_cargo_sums.push(results[team].rocket_high_cargo_sum * 3);
                    rocket_mid_panel_sums.push(results[team].rocket_mid_panel_sum * 2);
                    rocket_mid_cargo_sums.push(results[team].rocket_mid_cargo_sum * 3);
                    rocket_low_panel_sums.push(results[team].rocket_low_panel_sum * 2);
                    rocket_low_cargo_sums.push(results[team].rocket_low_cargo_sum * 3);
                    climb_avgs.push(
                        (results[team].climb_level_3_sum * 12 + 
                        results[team].climb_level_2_sum * 6 + 
                        results[team].climb_level_1_sum * 3) /
                        results[team].matches);
                    start_avgs.push((results[team].start_level_2_sum * 6 + results[team].start_level_1_sum * 3)/results[team].matches);
                }
                var cargo_side_panel_opr = math.lusolve(A, cargo_side_panel_sums);
                var cargo_side_cargo_opr = math.lusolve(A, cargo_side_cargo_sums);
                var cargo_front_panel_opr = math.lusolve(A, cargo_front_panel_sums);
                var cargo_front_cargo_opr = math.lusolve(A, cargo_front_cargo_sums);
                var rocket_high_panel_opr = math.lusolve(A, rocket_high_panel_sums);
                var rocket_high_cargo_opr = math.lusolve(A, rocket_high_cargo_sums);
                var rocket_mid_panel_opr = math.lusolve(A, rocket_mid_panel_sums);
                var rocket_mid_cargo_opr = math.lusolve(A, rocket_mid_cargo_sums);
                var rocket_low_panel_opr = math.lusolve(A, rocket_low_panel_sums);
                var rocket_low_cargo_opr = math.lusolve(A, rocket_low_cargo_sums);

                var oprs = {};
                var i = 0;
                for (var team in results) {
                    oprs[team] = {
                        'cargo_side_panel_opr': cargo_side_panel_opr[i][0],
                        'cargo_side_cargo_opr': cargo_side_cargo_opr[i][0],
                        'cargo_front_panel_opr': cargo_front_panel_opr[i][0],
                        'cargo_front_cargo_opr': cargo_front_cargo_opr[i][0],
                        'rocket_high_panel_opr': rocket_high_panel_opr[i][0],
                        'rocket_high_cargo_opr': rocket_high_cargo_opr[i][0],
                        'rocket_mid_panel_opr': rocket_mid_panel_opr[i][0],
                        'rocket_mid_cargo_opr': rocket_mid_cargo_opr[i][0],
                        'rocket_low_panel_opr': rocket_low_panel_opr[i][0],
                        'rocket_low_cargo_opr': rocket_low_cargo_opr[i][0],
                        'start_avg': start_avgs[i],
                        'climb_avg': climb_avgs[i]
                    };
                    oprs[team].opr = 
                        oprs[team].cargo_side_panel_opr +
                        oprs[team].cargo_side_cargo_opr +
                        oprs[team].cargo_front_panel_opr +
                        oprs[team].cargo_front_cargo_opr +
                        oprs[team].rocket_high_panel_opr +
                        oprs[team].rocket_high_cargo_opr +
                        oprs[team].rocket_mid_panel_opr +
                        oprs[team].rocket_mid_cargo_opr +
                        oprs[team].rocket_low_panel_opr +
                        oprs[team].rocket_low_cargo_opr +
                        oprs[team].start_avg +
                        oprs[team].climb_avg
                    i++;
                }

                callback(oprs);
            });
        }

    };

    if ( typeof exports !== 'undefined' ) {
        if ( typeof module !== 'undefined' && module.exports ) {
            exports = module.exports = TBA;
        }
        exports.TBA = TBA;
    } else {
        root.TBA = TBA;
    }

}).call(this);