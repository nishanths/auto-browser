// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log()
    if (message === 'getScreenState') {
        chrome.windows.get(sender.tab.windowId, function(chromeWindow) {
            // "normal", "minimized", "maximized" or "fullscreen"
            sendResponse(chromeWindow.state);
            console.log("window state:");	
            console.log(message);
        });
        return true; // Signifies that we want to use sendResponse asynchronously
    }
});

chrome.windows.getAll(null, function(w) {
	console.log(w);
	for (var i = 0; i < w.length; i++) {
		// console.log(i);
		var windowState = w[i].state;
		// console.log(windowState);
		console.log("Window id: " + w[i].id + " (" + w[i].state + ")");

		// query with Window.id
		chrome.tabs.query({windowId: w[i].id}, function(t){
			// for the tab-less windows such as the Inspector
			if (typeof t === "undefined") { 
				console.log("Please bitch about it");
			}

			for (var j = 0; j < t.length; j++) {
				if (windowState == "fullscreen") {
					console.log(t[j].url);
					if (/vimeo.com/.test(t[j].url)) {
						console.log("tab id " + t[j].id + " with a vimeo url has the status:");
						console.log(windowState);
						// Call the lights dimmer here
					}
				}
			}
		});
	}
});

var dist_callback_string = "?callback=useDistanceData";


var currentlyAway = false;

// console.log(res);
// console.log(typeof res);
// var farAwayFromComputer = res["farAwayFromComputer"];

setInterval(function() {
	console.log("Polling");

	var res = httpGet("http://localhost:3000/distance-sensors");
	var parsed = JSON.parse(res);
	var farAwayFromComputer = parsed.walkedAway;

	if (!farAwayFromComputer) {
		currentlyAway = false;
	}

	if (farAwayFromComputer && !currentlyAway)	{
		console.log("Logging out of Facebook because you moved awayFromComputer");
		currentlyAway = true;
		// Removes c_user cookie to logout Facebook
		chrome.cookies.remove({"url":"https://*.facebook.com/*", "name":"c_user"}, function(cookies){
			console.log("removed cookie:");
			console.log(cookies);	
			chrome.tabs.query({"url": "https://*.facebook.com/*"}, function(t) {
				for (var i = 0; i < t.length; i++) {
					chrome.tabs.update(t[i].id, {"url":"http://facebook.com/"});
				}
			});
		});
	}
}, 1000);


function httpGet(theUrl) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function useDistanceData(unparsed_json_resp) {
	// do stuff here
	console.log("G");
	console.log(typeof unparsed_json_resp);
}