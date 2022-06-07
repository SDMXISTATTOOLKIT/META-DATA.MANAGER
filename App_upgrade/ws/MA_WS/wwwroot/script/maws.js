function getAvailableStoreId(user, pass, func) {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "rest/store", true, user, pass);
    xhr2.onload = func;
    xhr2.send(null);
}
function getStatusMadb(user, pass, storeId, func) {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "rest/store/" + storeId + "/status", true, user, pass);
    xhr2.setRequestHeader("Accept", "application/json");
    xhr2.onload = func;
    xhr2.send(null);
}
function getVersionMadb(user, pass, storeId, func) {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "rest/store/" + storeId + "/version", true, user, pass);
    xhr2.setRequestHeader("Accept", "application/json");
    xhr2.onload = func;
    xhr2.send(null);
}
function initializeMadb(user, pass, storeId, func) {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "rest/store/" + storeId + "/status", true, user, pass);
    xhr2.setRequestHeader("Content-Type", "application/json");
    xhr2.onload = func;
    xhr2.send(JSON.stringify({ initialize: true }));
}