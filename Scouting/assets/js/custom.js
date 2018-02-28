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