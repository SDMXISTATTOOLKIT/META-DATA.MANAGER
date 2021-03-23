function searchConceptUrn(nodes, conceptIdList, conceptUrnList, conceptDistinct, nodeId) {
    if (nodes != null) {
        for (nodeIndex in nodes) {
            let node = nodes[nodeIndex];
            conceptIdList.push({ id: node.id, label: undefined });
            const sep = node.conceptIdentity.lastIndexOf(".");
            const cUrn = node.conceptIdentity.substring(0, sep);
            const cName = node.conceptIdentity.substring(sep + 1);
            let cIndex = undefined;
            for (i in conceptDistinct) {
                if (conceptDistinct[i].urn === cUrn) {
                    cIndex = i;
                    break;
                }
            }
            if (cIndex === undefined) {
                let cData = undefined;
                const triplet = getArtefactTripletFromUrn(cUrn);
                const conceptSchemeUrl = this.clientConfigs.fetchBaseUrl + "/conceptScheme/" + triplet.id + "/" + triplet.agencyID + "/" + triplet.version;
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

function replaceAttributeIdWithLabel(template, lang, nodeId) {
    try {
        const metadataSetId = urlParams.get('metadataSetId');
        let metadataset = null;
        let msd = null;
        if (nodeId == null || nodeId.trim().length == 0)
            throw "NodeId not found!";
        const metadatasetUrl = this.clientConfigs.fetchBaseUrl + "/api/RM/getJsonMetadataset/" + metadataSetId + "?excludeReport=true";
        let urlMSD = this.clientConfigs.fetchBaseUrl + "/msd/";

        loadJSON(metadatasetUrl,
            function (responseMT) {
                metadataset = JSON.parse(responseMT);
                const metadataSetName = metadataset.data.metadataSets[0].names[lang];
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
                const conceptIdList = [];
                const conceptDataList = [];
                const conceptUrnDistinct = [];
                loadJSON(urlMSD,
                    function (responseMSD) {
                        msd = JSON.parse(responseMSD);
                        msd.data.msds[0].metadataStructureComponents.reportStructureList.reportStructures.map(tree => {
                            searchConceptUrn(tree.metadataAttributeList.metadataAttributes, conceptIdList, conceptDataList, conceptUrnDistinct, nodeId);
                            return tree;
                        });
                        const msdUrn = msd.data.msds[0].urn;

                        let templateMod = (' ' + template).slice(1);
                          
                        templateMod = templateMod.replace("[[>METADATASET_ID]]", metadataSetId);
                        templateMod = templateMod.replace("[[>METADATASET_NAME]]", metadataSetName);
                        templateMod = templateMod.replace("[[>METADATASET_MSD]]", msdUrn);
                        templateMod = templateMod.replace("[[--METADATASET_MSD--]]", msdUrn);

                        for (conceptUrnIndex in conceptUrnDistinct) {
                            const conceptSchema = conceptUrnDistinct[conceptUrnIndex].data;
                            for (conceptIndex in conceptSchema.data.conceptSchemes[0].concepts) {
                                try {
                                    const currConcept = conceptSchema.data.conceptSchemes[0].concepts[conceptIndex];
                                    let cLabel = currConcept.names[lang];
                                    if (cLabel === undefined) {
                                        cLabel = currConcept.names[Object.keys(currConcept.names)[0]];
                                    }
                                    if (cLabel != undefined) {
                                        for (conceptDataIndex in conceptDataList) {
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

function computeAttributeSetJson(attributeSet) {
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
            }
        }
        for (const annIndex in currAttr.annotations) {
            let currAnn = currAttr.annotations[annIndex];
            // converto l'annotazione di allegato in un campo del JSON
            if (currAnn.id == "ATTACHED_FILE_PATH") {
                currAttr.attachedFile = { filename: currAnn.title };
                break;
            }
        }
        if (currAttr.attributeSet) {
            computeAttributeSetJson(currAttr.attributeSet);
        }
    }
}