function getArtefactTripletFromUrn(urn){
    const substr = urn.split('=')[1];
    return ({
        id: substr.split(':')[1].split('(')[0],
        agencyID: substr.split(':')[0],
        version: substr.split('(')[1].split(')')[0],
    });
};

function getMappedTree(tree, childrenKey, map) {
    //tree = _.cloneDeep(tree);
    tree = tree.map(root => map(root));
    tree = tree.map(subTree => {
        if (subTree[childrenKey]) {
            subTree[childrenKey] = getMappedTree(subTree[childrenKey], childrenKey, map);
        }
        return subTree;
    });
    return tree;
};

function loadJSON(jsonFilePath, callback, notFound, nodeId) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonFilePath, false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        } else if (xobj.status == "404" && notFound) {
            notFound();
        } else {
            alert("Setting data not found!");
        }
    };
    if (nodeId != null) {
        xobj.setRequestHeader('nodeId', nodeId);
    }
    xobj.send(null);
};

function downloadResource(url, nodeId, nameResource, httpMethod = 'GET', type = 'application/json') {
    let xobj = new XMLHttpRequest();
    xobj.open(httpMethod, url, false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            var blob = new Blob([xobj.responseText], { type: type });
            var temUrl = URL.createObjectURL(blob);
     
            var link = document.createElement("a");
            link.download = nameResource;
            link.href = temUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            delete link;
        } else if (xobj.status == "404" && notFound) {
            alert("Resource not found!");
        } else {
            alert("Setting data not found!");
        }
    };
    if (nodeId != null) {
        xobj.setRequestHeader('nodeId', nodeId);
    }
    xobj.send(null);
};

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat)
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
};

function concatPaths() {
  var result = "";
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] != null) {
      var currPath = arguments[i].trim();
	  if(currPath.length>0){
		  if(result.endsWith("/")){
			  if(currPath.startsWith("/")){
				  currPath = currPath.substring(1);
			  }
		  }else{
			  if(!currPath.startsWith("/") && result != ""){
				  currPath = "/" + currPath;
			  }
		  }
		  result += currPath;
	  }
    }
  }
  return result;
};
