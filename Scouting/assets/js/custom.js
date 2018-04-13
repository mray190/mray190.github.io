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

function getHash(value) {

  var hash = 0;
  if (value.length == 0) {
    return hash;
  }
  for (var i = 0; i < value.length; i++) {
    var char = value.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Initialize Firebase
var config = {
	apiKey: "b57zJeLRQ1sAqIvoF06YmXsIc8Z0DD2uT8lMB6M9",
    authDomain: "viperbotsvalor.firebaseapp.com",
    projectId: 'viperbotsvalor',
	databaseURL: "https://viperbotsvalor.firebaseio.com",
	storageBucket: "gs://viperbotsvalor.appspot.com"
};

var regionalCode = "carv";

var tba_api_key = "LCBZ7qqYrBR0e06C4QJEjaW1O7r2TZat7KZwvQcfDqShwIxV4N7epHK9lbafjc4M";
var tba_base_url = "https://www.thebluealliance.com/api/v3/";

function tbaCall(url_extension, last_modified, callback, useModify) {
    var headerWithModify = {
        "if-modified-since": last_modified,
        'x-tba-auth-key': tba_api_key
    };
    var headerWithoutModify = { 'x-tba-auth-key': tba_api_key};
	$.ajax({
		url: tba_base_url+url_extension,
		type: "GET",
	  	crossDomain: true,
 		headers: useModify ? headerWithModify : headerWithoutModify,
 		success: callback,
        error: function(xhr, textStatus, errorThrown) { console.log("ERROR: " + errorThrown); }
	});
}

function saveToStorage(key, data, last_modified) {
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(key, JSON.stringify(data));
		setCookie("lastModified_"+key, last_modified, 1);
	}
}

function getData(key, url_extension, callback, useModify) {
	tbaCall(url_extension, getCookie("lastModified_" + key, useModify), function(data, textStatus, request) {
        if (useModify) {
    		var last_modified = request.getResponseHeader('last-modified');
    		var old_data = JSON.parse(localStorage.getItem(key));
            var new_data = mergeDeep(old_data, data);
    		saveToStorage(key, new_data, last_modified);
    		callback(new_data);
        } else {
            callback(data);
        }
	});
}


// Credit to: https://gist.github.com/sinemetu1/1732896
function mergeDeep (o1, o2) {
    if (o1==null)
        o1 = {};
    var tempNewObj = o1;

    //if o1 is an object - {}
    if (o1.length === undefined && typeof o1 !== "number") {
        $.each(o2, function(key, value) {
            if (o1[key] === undefined) {
                tempNewObj[key] = value;
            } else {
                tempNewObj[key] = mergeDeep(o1[key], o2[key]);
            }
        });
    }

    //else if o1 is an array - []
    else if (o1.length > 0 && typeof o1 !== "string") {
        $.each(o2, function(index) {
            if (JSON.stringify(o1).indexOf(JSON.stringify(o2[index])) === -1) {
                tempNewObj.push(o2[index]);
            }
        });
    }

    //handling other types like string or number
    else {
        //taking value from the second object o2
        //could be modified to keep o1 value with tempNewObj = o1;
        tempNewObj = o2;
    }
    return tempNewObj;
};