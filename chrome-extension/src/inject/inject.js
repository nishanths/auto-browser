chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
});

// function isFullScreen(callback) {
//     chrome.runtime.sendMessage('getScreenState', function(result) {
//         callback(result === 'fullscreen');
//     });
// }
// // Example: Whenever you want to know the state:
// isFullScreen(function(isFullScreen) {
//     alert('Window is ' + (isFullScreen ? '' : 'not ') + 'in full screen mode.');
// });