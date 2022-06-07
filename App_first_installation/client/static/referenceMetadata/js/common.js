function searchConceptUrn(nodes, conceptIdList, conceptUrnList, conceptDistinct, nodeId, metadataBaseUrl) {
    if (nodes != null) {
        for (let nodeIndex in nodes) {
            let node = nodes[nodeIndex];
            conceptIdList.push({ id: node.id, label: undefined });
            const sep = node.conceptIdentity.lastIndexOf(".");
            const cUrn = node.conceptIdentity.substring(0, sep);
            const cName = node.conceptIdentity.substring(sep + 1);
            let cIndex = undefined;
            for (let i in conceptDistinct) {
                if (conceptDistinct[i].urn === cUrn) {
                    cIndex = i;
                    break;
                }
            }
            if (cIndex === undefined) {
                let cData = undefined;
                const triplet = getArtefactTripletFromUrn(cUrn);
                let conceptSchemeUrl = metadataBaseUrl + "/conceptScheme/" + triplet.id + "/" + triplet.agencyID + "/" + triplet.version;
                if (nodeId && nodeId.trim().length > 0) {
                    conceptSchemeUrl += "?nodeId=" + nodeId;
                }
                loadJSON(conceptSchemeUrl,
                    function (response) {
                        cData = JSON.parse(response);
                        conceptDistinct.push({ urn: cUrn, data: cData });
                    }, function () {
                    }, nodeId
                );
                cIndex = conceptDistinct.length - 1;
            }
            conceptUrnList.push({ urn: cUrn, name: cName, index: cIndex });
            let nextNode = null;
            try {
                nextNode = node.metadataAttributes;
                searchConceptUrn(nextNode, conceptIdList, conceptUrnList, conceptDistinct, nodeId);
            } catch (e) { }
        }
    }
};

function replaceAttributeIdWithLabel(template, lang, nodeId, metadataBaseUrl) {
    try {
        const metadataSetId = urlParams.get('metadataSetId');
        let metadataset = null;
        let msd = null;
        if (nodeId == null || nodeId.trim().length == 0)
            throw "NodeId not found!";

        let metadatasetUrl = metadataBaseUrl + "/getJsonMetadataset/" + metadataSetId + "?excludeReport=true";
        if (nodeId && nodeId.trim().length > 0) {
            metadatasetUrl += "&nodeId=" + nodeId;
        }
        let urlMSD = metadataBaseUrl + "/msd/";

        loadJSON(metadatasetUrl,
            function (responseMT) {
                metadataset = JSON.parse(responseMT);
				const mtNames = metadataset.data.metadataSets[0].names;
                var metadataSetName = mtNames[lang];
				if(!metadataSetName){
					metadataSetName = mtNames[Object.keys(mtNames)[0]];
				}
                let id = '';
                let agency = '';
                let version = '';
                for (var annIndex in metadataset.data.metadataSets[0].annotations) {
                    const ann = metadataset.data.metadataSets[0].annotations[annIndex];
                    if (ann.id == 'MSDId') {
                        id = ann.text;
                    }
                    if (ann.id == 'MSDAgency') {
                        agency = ann.text;
                    }
                    if (ann.id == 'MSDVersion') {
                        version = ann.text;
                    }
                }
                urlMSD += id + "/" + agency + "/" + version;
                if (nodeId && nodeId.trim().length > 0) {
                    urlMSD += "?nodeId=" + nodeId;
                }
                const conceptIdList = [];
                const conceptDataList = [];
                const conceptUrnDistinct = [];
                loadJSON(urlMSD,
                    function (responseMSD) {
						let templateMod = (' ' + template).slice(1);
                        msd = JSON.parse(responseMSD);
						
						try{
						if(templateMod.indexOf("[[--TARGET_REF--]]")>-1){
							let htmlTargetRef = '';
							var metadataTargetsVar = msd.data.msds[0].metadataStructureComponents.metadataTargetList.metadataTargets;
							metadataTargetsVar.forEach(currMRef => {
								currMRef.identifiableTarget.forEach(currRef => {
									htmlTargetRef +='<tr id="tr-span-' + currRef.id + '"><td><b>' + currRef.objectType + '</b>: <span id="span-' + currRef.id + '"></span></td></tr>';
								});
							});
							//metadataTargetsVar[metadataTargetsVar.length-1].identifiableTarget.forEach(currRef => {
							//	htmlTargetRef +='<tr><td><b>' + currRef.objectType + '</b>: <span id="span-' + currRef.id + '"></span></td></tr>';
							//});
							templateMod = templateMod.replace("[[--TARGET_REF--]]", htmlTargetRef);
						}
						} catch (e) { }
						
                        msd.data.msds[0].metadataStructureComponents.reportStructureList.reportStructures.map(tree => {
                            searchConceptUrn(tree.metadataAttributeList.metadataAttributes, conceptIdList, conceptDataList, conceptUrnDistinct, nodeId, metadataBaseUrl);
                            return tree;
                        });
                        const msdUrn = msd.data.msds[0].urn;
                        let msdWithoutUrn = msdUrn;
						if(msdWithoutUrn.indexOf("=")>-1){
							msdWithoutUrn = msdWithoutUrn.substring(msdWithoutUrn.indexOf("=")+1);
						}
						
                        templateMod = templateMod.replace("[[>METADATASET_ID]]", metadataSetId);
                        templateMod = templateMod.replace("[[>METADATASET_NAME]]", metadataSetName);
                        templateMod = templateMod.replace("[[>METADATASET_MSD]]", msdWithoutUrn);
                        templateMod = templateMod.replace("[[--METADATASET_MSD--]]", msdWithoutUrn);

                        for (let conceptUrnIndex in conceptUrnDistinct) {
                            const conceptSchema = conceptUrnDistinct[conceptUrnIndex].data;
                            for (let conceptIndex in conceptSchema.data.conceptSchemes[0].concepts) {
                                try {
                                    const currConcept = conceptSchema.data.conceptSchemes[0].concepts[conceptIndex];
                                    let cLabel = currConcept.names[lang];
                                    if (cLabel === undefined) {
                                        cLabel = currConcept.names[Object.keys(currConcept.names)[0]];
                                    }
                                    if (cLabel != undefined) {
                                        for (let conceptDataIndex in conceptDataList) {
                                            const cdIndex = conceptDataList[conceptDataIndex].index;
                                            const cdName = conceptDataList[conceptDataIndex].name;
                                            if (cdIndex == conceptUrnIndex && cdName == currConcept.id) {
                                                conceptIdList[conceptDataIndex].label = cLabel;
                                                let toReplace = ">" + conceptIdList[conceptDataIndex].id + "<";
                                                toReplace = new RegExp(toReplace, "g");
                                                templateMod = templateMod.replace(toReplace, ">" + cLabel + "<");
                                            }
                                        }
                                    }
                                } catch (e) { }
                            }
                        }
                        template = templateMod;
                    }, function () {
                        alert('MSD not found!');
                    }, nodeId
                );
            }, function () {
                alert('MetadataSet not found!');
            }, nodeId
        );
    } catch (e) { }
    return template;
}

function computeJsonObject(jsonObj) {
    for (var field in jsonObj) {
        if (jsonObj.hasOwnProperty(field)) {
            var cValue = jsonObj[field];
            if (cValue && (typeof cValue === 'string' || cValue instanceof String)) {
                try {
                    let attrValue = decodeURIComponent(jsonObj[field]);
                    //attrValue = attrValue.replace(/<[^>]*>?/gm, '');
                    //attrValue = attrValue.replace(/&[^;]*;?/gm, '');
                    //attrValue = attrValue.replace(/&[\w\W]*;/g, '')
                    jsonObj[field] = attrValue;
                } catch (e) {
                    jsonObj[field] = cValue;
                }
            } else if (cValue && (typeof cValue === 'object' || cValue instanceof Object)) {
                computeJsonObject(cValue);
            }
        }
    }
}

function checkLanguageFieldIntoJson(jsonObj, language) {
			for (var field in jsonObj) {
				if (jsonObj.hasOwnProperty(field)) {
					var cValue = jsonObj[field];
					if (cValue && (typeof cValue === 'object' || cValue instanceof Object)) {
						if(field == "texts"){
							const vLang = cValue[language];
							const firstLang = Object.keys(cValue)[0];
							if(!vLang && firstLang != "und"){
								cValue[language] = cValue[firstLang];
							}
						}
						checkLanguageFieldIntoJson(cValue, language);
					}
				}
			}
		}

function computeAttributeSetJson(attributeSet,lang) {
    for (const attrIndex in attributeSet.reportedAttributes) {
        let currAttr = attributeSet.reportedAttributes[attrIndex];
        // faccio il decod di tutti i valori
        if (currAttr.texts) {
            for (var i in currAttr.texts) {
                //const cField = Object.keys(currAttr.texts)[i];
                var cValue = currAttr.texts[i];
                if (cValue && (typeof cValue === 'string' || cValue instanceof String)) {
                    try {
                        currAttr.texts[i] = decodeURIComponent(cValue);
                    } catch (e) {
                        currAttr.texts[i] = cValue;
                    }
                }
                if (!currAttr.texts.hasOwnProperty("link")) {
                    if ((currAttr.texts[i].startsWith("http") || currAttr.texts[i].startsWith("www"))) {
						if (currAttr.texts[i].startsWith("http")) {
                            currAttr.texts['link'] = { 'href':currAttr.texts[i] };
						}else{
                            currAttr.texts['link'] = { 'href':'http://' + currAttr.texts[i] };
						}
                    }
                }
            }
        }
        for (const annIndex in currAttr.annotations) {
            let currAnn = currAttr.annotations[annIndex];
            // converto l'annotazione di allegato in un campo del JSON
            if (currAnn.id == "ATTACHED_FILE_PATH") {
                if (currAnn.texts) {
                    if (lang && currAnn.texts[lang]) {
                        currAttr.attachedFile = { filename: currAnn.texts[lang] };
                    } else {
                        const firstLang = Object.keys(currAnn.texts)[0];
                        currAttr.attachedFile = { filename: currAnn.texts[firstLang] };
                    }
                }else if (currAnn.title) {
                    currAttr.attachedFile = { filename: currAnn.title };
                }
                break;
            }
        }
        if (currAttr.attributeSet) {
            computeAttributeSetJson(currAttr.attributeSet, lang);
        }
    }
}