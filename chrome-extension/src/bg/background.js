var api_endpoint = "http://10.145.60.81:8080";

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
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

// Big picture: Tells the hardware to turn lights off depending on Vimeo's full screen
chrome.webNavigation.onCommitted.addListener(function(e) {
    	// Look at all tabs in each Chrome window
    	// If one of the tabs is Vimeo full screen, POST to dim lights
    	console.log("I'm up because a vimeo page was loaded.");
      	chrome.windows.getAll(null, function(w) {
			for (var i = 0; i < w.length; i++) {
				var windowState = w[i].state;
				console.log("Window id: " + w[i].id + " (" + w[i].state + ")");

				// query with Window.id
				chrome.tabs.query({windowId: w[i].id}, function(t){
					// for the tab-less windows such as the Inspector
					if (typeof t === "undefined") { 
						console.log("Please bitch about it");
					}

					for (var j = 0; j < t.length; j++) {
						console.log(t[j].url);
						if (/vimeo.com/.test(t[j].url) || /youtube.com/.test(t[j].url)) {
							console.log("tab id " + t[j].id + " with a vimeo url has the status:");
							console.log(windowState);
							var tabID = t[j].id;

							// Make a POST to
							// Call the lights dimmer here
							console.log("POSTing");
							var s = httpGet("/dim-lights");
							console.log(s);

							// Add listener for removal
							chrome.tabs.onRemoved.addListener(function(tabID) {
								console.log("Video tab with id:" + tabID + " was removed");
								console.log("Now telling lights to come back on.");
								httpGet("/brighten-lights");	
							}); 
						}
					}
				});
			}
		});
}, { url: [ {urlMatches: 'vimeo.com'}, {urlMatches: 'youtube.com'}, {urlMatches: 'netflix.com'} ] });


var prevIsAway = true;

setInterval(function() {
	var res = httpGet("/distance-sensors");
	var parsed = JSON.parse(res);
	console.log(parsed.distance);
	var isAway = parsed.away;

	if (isAway && !prevIsAway)	{
		console.log("Logging out of Facebook because you are currentlyAway");
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

	prevIsAway = isAway;
}, 1000);

function httpGet(path) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", api_endpoint + path, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

function httpPost(path, message) {
  var client = new XMLHttpRequest();
  client.open("POST", api_endpoint + path);
  client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
  client.send(message);
}

function useDistanceData(unparsed_json_resp) {
  console.log(typeof unparsed_json_resp);
}
