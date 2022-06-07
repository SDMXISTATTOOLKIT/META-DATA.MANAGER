var sri = sri || {};
sri.authws = {
	getAllowedStoreId: function(user, pass, func) {
		var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", "rest/auth/storeId", true, user, pass);
		xhr2.onload = func;
		xhr2.send(null);
	},
	getSpecificStoreId: function(user, pass, storeId, func) {
		var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", "rest/auth/storeId/" + storeId , true, user, pass);
		xhr2.onload = func;
		xhr2.send(null);
	},
	getUser: function(user, pass, queryUser, func) {
		var xhr2 = new XMLHttpRequest();
		var requestedUser = queryUser || user;
        xhr2.open("GET", "rest/auth/user/" + requestedUser, true, user, pass);
		xhr2.onload = func;
		xhr2.send(null);
	},
	changePass: function(user, pass, queryUser, newPass, func) {
		var xhr = new XMLHttpRequest();
        xhr.open("PUT", "rest/auth/user/" + queryUser + "/password", true, user, pass);

		// encoded not encrypted, we do this to pass symbol characters that might cause issues otherwise
		var encoded = window.btoa(newPass);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onload = func;
		xhr.send(JSON.stringify({ "password": encoded }));
	},

	addStoreId: function(user, pass, storeId, func) {
		var xhr2 = new XMLHttpRequest();
        xhr2.open("PUT", "rest/auth/storeId/" + storeId, true, user, pass);
		xhr2.setRequestHeader("Content-Type", "application/json");
		xhr2.onload = func;
		xhr2.send(null);
	},
	addOrUpdateUser: function(user, pass, requestedUser, func) {
		var xhr2 = new XMLHttpRequest();
		var userName = Object.keys(requestedUser)[0];
        xhr2.open("PUT", "rest/auth/user/" + userName, true, user, pass);
		xhr2.setRequestHeader("Content-Type", "application/json");
		xhr2.onload = func;
		xhr2.send(JSON.stringify(requestedUser));
	},
	init: function(version, func) {
		var httpRequest = new XMLHttpRequest();
        httpRequest.open("PUT", "rest/auth/version/current", true);
		httpRequest.setRequestHeader("Content-Type", "application/json");

		httpRequest.onload = func;

		httpRequest.send(JSON.stringify(version));
	},
	availableVersion: function(func) {
		var httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", "rest/auth/version/available", true);
		httpRequest.setRequestHeader("Accept", "application/json");

		httpRequest.onload = func;

		httpRequest.send(null);
	},
	checkStatus: function(func) {
		var httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", "rest/auth/version/current", true);
		httpRequest.setRequestHeader("Accept", "application/json");

		httpRequest.onload = func;

		httpRequest.send(null);
	}
};
