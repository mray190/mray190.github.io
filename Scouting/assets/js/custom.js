function nav_bar_click() {
	var x = document.getElementById("nav_bar");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Initialize Firebase
var config = {
	apiKey: "b57zJeLRQ1sAqIvoF06YmXsIc8Z0DD2uT8lMB6M9",
	authDomain: "viperbotsvalor.firebaseapp.com",
	databaseURL: "https://viperbotsvalor.firebaseio.com",
	storageBucket: "bucket.appspot.com"
};

var tba_api_key = "LCBZ7qqYrBR0e06C4QJEjaW1O7r2TZat7KZwvQcfDqShwIxV4N7epHK9lbafjc4M";
var tba_base_url = "https://www.thebluealliance.com/api/v3/";

function tbaCall(url_extension, last_modified, callback) {
	$.ajax({
		url: tba_base_url+url_extension,
		type: "GET",
 		headers: {
    		// "if-modified-since": last_modified,
 			'x-tba-auth-key': tba_api_key
 		},
 		success: callback
	});
}

function saveToStorage(key, data, last_modified) {
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(key, JSON.stringify(data));
		setCookie("lastModified_"+key, last_modified, 1);
	}
}

function getData(key, url_extension, callback) {
	tbaCall(url_extension, getCookie("lastModified_" + key), function(data) {
		var last_modified = "";
		var old_data = localStorage.getItem(key);
		saveToStorage(key, data, last_modified);
		callback(old_data, data);
	});
}