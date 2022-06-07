
if(window.location.href.includes("localhost:3000")){  // development
    window.config = {
        baseRESTUrl: "http://localhost/maws/",
        baseNsiRESTUrl: "http://localhost/maws/sdmx/rest/",
        maID: "MappingStoreServer"
    };    
}
else{
    console.log('INITIAL ULR: ' + window.location.href);
    const splitURL = window.location.href.split("maweb")[0];
    console.log('SPLIT URL: ' + splitURL);
    window.config = {
        baseRESTUrl: splitURL + "rest/", 
		baseNsiRESTUrl: splitURL + "sdmx/rest/",
        maID: "MappingStoreServer"
    };    
}  
