/* CRUD */
const getArtefactUrl = artefactTriplet => artefactTriplet
  ? `/${artefactTriplet.id}/${artefactTriplet.agencyID}/${artefactTriplet.version}`
  : '';
export const getDsdUrl = (dsdTriplet, excludeCustom) =>
  'dsd' + (dsdTriplet ? getArtefactUrl(dsdTriplet) : '') +
  (!dsdTriplet && excludeCustom ? '/true' : '');

export const getCodelistUrl = triplet => 'codelist' + (triplet ? getArtefactUrl(triplet) : '');
export const getAgencySchemeUrl = triplet => 'agencyScheme' + (triplet ? getArtefactUrl(triplet) : '');
export const getPaginatedCodelistUrl = () => 'NOSQL/codelist';
export const getUpdateCodelistUrl = (triplet, lang) => `NOSQL/save${getArtefactUrl(triplet)}/${lang}`;
export const getCloneCodelistUrl = (srcTriplet, destTriplet) => `codelist/clone${getArtefactUrl(srcTriplet)}${getArtefactUrl(destTriplet)}`;
export const getInsertItemUrl = (triplet, lang) => `/NOSQL/insert${getArtefactUrl(triplet)}/${lang}`;
export const getUpdateItemUrl = (triplet, lang) => `/NOSQL/update${getArtefactUrl(triplet)}/${lang}`;
export const getDeleteItemUrl = (triplet, itemId, lang, autoSave) => `/NOSQL/codelist${getArtefactUrl(triplet)}/${itemId}/${lang}/${autoSave}`;
export const getMoveItemUrl = (triplet, lang) => `/NOSQL/move${getArtefactUrl(triplet)}/${lang}`;
export const getAvailableParentUrl = () => 'NOSQL/parentsAvailable';

export const getCubeUrl = cubeId => 'cube' + (cubeId ? `/${cubeId}` : '');
export const getAllCubeUrl = () => 'cubesNoFilter';
export const getDcsUrl = () => 'dcs';
export const getFileMappingUrl = fileMappingId =>
  'fileMapping' + (fileMappingId ? `/${fileMappingId}` : '');
export const getCategorySchemeUrl = (categorySchemeTriplet, withCategorisations) =>
  'categoryScheme'
  + (categorySchemeTriplet ? getArtefactUrl(categorySchemeTriplet) : '')
  + (withCategorisations ? '/parents' : '');
export const getConceptSchemeUrl = (conceptSchemeTriplet, withCategorisations) =>
  'conceptScheme'
  + (conceptSchemeTriplet ? getArtefactUrl(conceptSchemeTriplet) : '')
  + (withCategorisations ? '/parents' : '');
export const getDdbDataflowUrl = ddbDataflowId =>
  'ddbDataflow' + (ddbDataflowId ? `/${ddbDataflowId}` : '');
export const getDataflowUrl = dataflowTriplet =>
  'dataflow' + (dataflowTriplet ? getArtefactUrl(dataflowTriplet) : '');
export const getMsdUrl = msdTriplet => 'msd' + (msdTriplet ? getArtefactUrl(msdTriplet) : '');
export const getHierarchicalCodelistUrl = hierarchicalCodelistTriplet => 'getHierarchicalCodelist' + (hierarchicalCodelistTriplet ? getArtefactUrl(hierarchicalCodelistTriplet) : '');
export const getMetadataflowUrl = metadataflowTriplet =>
  'metadataflow' + (metadataflowTriplet ? getArtefactUrl(metadataflowTriplet) : '');

const getUsernameUrl = username => `${username ? `/${username}` : ''}`;

export const getAgencyUrl = username => 'getAgency' + getUsernameUrl(username);
export const getAgencyNamesUrl = () => 'AgencyName';
export const getUpdateArtefactsUrl = () => 'updateArtefacts';
export const getCreateArtefactsUrl = () => 'createArtefacts';

export const getDeleteArtefactUrl = (artefactType, artefactTriplet) =>
  'artefact/' + artefactType + getArtefactUrl(artefactTriplet);

export const getDataflowHeader = dataflowTriplet => 'getDfHeader' + getArtefactUrl(dataflowTriplet);

export const getCreateDdbDataflowUrl = () => '/createDDBDataflow';
export const getUpdateDdbDataflowUrl = () => '/updateDDBDataflow';

export const getContentConstraintUrl = triplet => `/getContentConstraint${getArtefactUrl(triplet)}`;
export const getDataflowContentConstraintUrl = artefactTriplet => "ArtefactContentConstraint/dataflow" + getArtefactUrl(artefactTriplet);

export const getArtefactReferenceUrl = (artefactType, artefactTriplet) => `artefactReference/${artefactType}${getArtefactUrl(artefactTriplet)}`;

export const getMetadataSetsUrl = () => 'api/RM/getJsonMetadatasetList';
export const getMetadataSetUrl = (metadataSetId, withReports) => `api/RM/getJsonMetadataset/${metadataSetId}/?withAttributes=true&excludeReport=${!withReports}`;
export const getUpsertMetadataSetUrl = () => 'api/RM/upsertJsonMetadataSet';
export const getDeleteMetadataSetUrl = metadataSetId => `api/RM/deleteGenericMetadataset/${metadataSetId}`;

export const getUpsertJsonReportUrl = metadataSetId => `api/RM/upsertJsonReport/${metadataSetId}`;
export const getDeleteReportUrl = reportDbId => `api/RM/deleteReport/${reportDbId}`;
export const getUpdateStateReportUrl = (metadataSetId, reportId) => `api/RM/updateStateMetReport/${metadataSetId}/${reportId}`;

export const getPaginatedDerivedCodelistUrl = isTarget => `NOSQL/preview/codelist/${isTarget}`;
export const getDerivedCodelistSelectTargetItemUrl = (artefactTriplet, isSelected, lang) =>
  `NOSQL/preview/selectedItem/${isSelected}${getArtefactUrl(artefactTriplet)}/${lang}`;
export const getDerivedCodelistSelectSourceItemUrl = (artefactTriplet, isSelected, lang) =>
  `NOSQL/selectedItem/${isSelected}${getArtefactUrl(artefactTriplet)}/${lang}`;
export const getDerivedCodelistSelectAllItemsUrl = (artefactTriplet, isTarget, isSelected, lang) =>
  `NOSQL/selectAllItem/${isTarget}/${isSelected}${getArtefactUrl(artefactTriplet)}/${lang}`;
export const getDerivedCodelistStoreSelectedItemsUrl =
  (artefactTriplet, isTarget, lang, removeParent, parents, children, descendants) =>
    `NOSQL/preview/storeSelectedItem/${isTarget}${getArtefactUrl(artefactTriplet)}/${lang}/${parents}/${children}/${descendants}/${removeParent}`;
export const getDerivedCodelistCreateUrl = (artefactTriplet, lang) => `NOSQL/save/preview${getArtefactUrl(artefactTriplet)}/${lang}`;
export const getDerivedCodelistRestoreDbUrl = artefactTriplet => 'NOSQL/previewEmpty' + getArtefactUrl(artefactTriplet);
export const getDerivedCodelistIsSourceItemValidUrl = (artefactTriplet, lang) => `NOSQL/previewIsValid${getArtefactUrl(artefactTriplet)}/${lang}`;
export const getSetDefaultOrderUrl = (artefactTriplet, lang) => `NOSQL/copyorder${getArtefactUrl(artefactTriplet)}/${lang}`;

export const getUpdateMsdUrl = () => "msd";
export const getUpdateHierarchicalCodelistUrl = () => "updateHierarchicalCodelist";

export const getSeriesForCubeUrl = cubeId => `/SeriesForCube/${cubeId}`;
export const getDeleteSeriesForCubeUrl = cubeId => `RemoveSeriesForCube/${cubeId}`;

/* UTILITY */
export const getUploadFileOnServerUrl = cubeId => 'uploadFileOnServer' + (cubeId ? `/${cubeId}` : '');
export const getCsvHeaderUrl = (separator, delimiter, hasHeader, filePath) =>
  `getCSVHeader/${encodeURIComponent(separator)}/${hasHeader}${delimiter !== null ? `/${encodeURIComponent(delimiter)}` : ''}?filePath=${encodeURIComponent(filePath)}`;

export const getCsvTablePreviewUrl = (separator, delimiter, hasHeader, filePath, tid, idMappingSpecialTimePeriod) =>
  `getCSVTablePreview/${encodeURIComponent(separator)}/${hasHeader}${delimiter !== null ? `/${encodeURIComponent(delimiter)}` : ''}?filePath=${encodeURIComponent(filePath)}`
  + (tid !== null ? `&tid=${encodeURIComponent(tid)}` : '') + (idMappingSpecialTimePeriod !== null ? `&idMappingSpecialTimePeriod=${encodeURIComponent(idMappingSpecialTimePeriod)}` : '');

export const getCsvTableColumnPreviewUrl = (separator, delimiter, hasHeader, filePath) =>
  `getCSVTableColumnPreview/${encodeURIComponent(separator)}/${hasHeader}${delimiter !== null ? `/${encodeURIComponent(delimiter)}` : ''}?filePath=${encodeURIComponent(filePath)}`;

export const getImportCsvUrl = (separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, idMappingSpecialTimePeriod, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) =>
  `importCSVData/${encodeURIComponent(separator)}/${hasHeader}/${importType}/${cubeId}/${mappingId}${delimiter !== null ? `/${encodeURIComponent(delimiter)}` : ''}` +
  `?filePath=${encodeURIComponent(filePath)}` +
  (tid != null ? `&tid=${encodeURIComponent(tid)}` : '') +
  (idMappingSpecialTimePeriod !== null ? `&idMappingSpecialTimePeriod=${encodeURIComponent(idMappingSpecialTimePeriod)}` : '') +
  (embargo === true ? `&embargo=true` : '') +
  (refreshProdDf === true ? '&refreshProdDf=true' : '') +
  (checkFiltAttributes === true ? '&checkFiltAttributes=true' : '') +
  (ignoreConcurrentUpload === true ? '&ignoreCuncurrentUpload=true' : '');

export const getTablePreviewUrl = (tableName) =>
  `getTablePreview/${encodeURIComponent(tableName)}`;

export const getTableColumnPreviewUrl = tableName =>
  `getTableColumnPreview/${encodeURIComponent(tableName)}`;

export const getSdmxMlTablePreviewUrl = (dsdId, dsdAgencyId, dsdVersion, filePath) =>
  `getSDMXMLTablePreview/${dsdId}/${dsdAgencyId}/${dsdVersion}?filePath=${encodeURIComponent(filePath)}`;

export const getImportSdmxMlUrl = (importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) =>
  `importSDMXMLData/${importType}/${cubeId}/${dsdId}/${dsdAgencyId}/${dsdVersion}` +
  `?filePath=${encodeURIComponent(filePath)}` +
  (tid !== null ? `&tid=${tid}` : '') +
  (embargo === true ? `&embargo=true` : '') +
  (refreshProdDf === true ? '&refreshProdDf=true' : '') +
  (checkFiltAttributes === true ? '&checkFiltAttributes=true' : '') +
  (ignoreConcurrentUpload === true ? '&ignoreCuncurrentUpload=true' : '');

export const getImportDCSUrl = (id, agencyId, version) => `importDCS/${id}/${agencyId}/${version}`;

export const getDataflowPreviewUrl = checkFilter =>
  `getDDBDataflowPreview/${checkFilter ? "true" : ""}`;

export const getDataflowColumnPreviewUrl = (colName, pageNum, pageSize) =>
  `getDataflowColumnPreview/${colName}/${pageNum}/${pageSize}`;

export const getDataflowCsvUrl = (separator, delimiter, compression) =>
  `getDDBDataflowCsv/${compression}?separator=${encodeURIComponent(separator)}${delimiter ? `&delimiter=${encodeURIComponent(delimiter)}` : ''}`;

export const getDownloadArtefactUrl =
  (artefactType, artefactTriplet, format, references, compression, lang, separator, delimiter) =>
    `downloadMetadati/${artefactType}${getArtefactUrl(artefactTriplet)}/${format}/${references}/${compression}/${lang}` +
    `${separator ? `/${separator}` : ''}${delimiter ? `/${delimiter}` : ''}`;
export const getMultipleDownloadArtefactUrl = (artefactType, format, references, compression, lang) =>
  `downloadMetadati/${artefactType}/${format}/${references}/${compression}/${lang}`;

export const getDownloadDdbdataflowUrl = (format, compression, separator, delimiter, dimension) =>
  `/downloadDataflow/${format}/${compression}${separator ? `/${separator}` : ''}${delimiter ? `/${delimiter}` : ''}` +
  (dimension ? `?observation=${dimension}` : '');

export const getExportArtefactUrl = () => "DuplicateArtefact";

export const getCheckImportedFileXmlSdmxObjectsUrl = () => 'checkImportedFileXmlSdmxObjects';
export const getImportFileXmlSdmxObjectsUrl = () => 'importFileXmlSdmxObjects';

export const getCreateDataflowMappingSetUrl =
  (ddbDataflowId, defaultValue) =>
    `CreateMappingSetForDataflow/${ddbDataflowId}${defaultValue ? `/${encodeURIComponent(defaultValue)}` : ''}`;
export const getRemoveDataflowMappingSetUrl =
  ddbDataflowId => `RemoveMappingSetForDataflow/${ddbDataflowId}`;
export const getCreateDataflowTranscodingUrl =
  ddbDataflowId => `CreateTranscodingsForDataflow/${ddbDataflowId}`;
export const getCreateDataflowTranscodingFromCCUrl = (ddbDataflowId, contentConstraintTriplet) =>
  `CreateTranscodingsFromCCForDataflow/${ddbDataflowId}/${contentConstraintTriplet.agencyID}/${contentConstraintTriplet.id}/${contentConstraintTriplet.version}`;
export const getRemoveDataflowTranscodingUrl = ddbDataflowId =>
  `RemoveTranscodingsForDataflow/${ddbDataflowId}`;
export const getCreateDataflowContentConstraintUrl =
  ddbDataflowId => `CreateContentConstraintsForDataflow/${ddbDataflowId}`;
export const getRemoveDataflowContentConstraintUrl =
  ddbDataflowId => `RemoveContentConstraintsForDataflow/${ddbDataflowId}`;
export const getSetDataflowProductionFlagUrl =
  (ddbDataflowId, isProduction) => `SetDataflowProductionFlag/${ddbDataflowId}/${isProduction}`;

export const getMappingSetIdUrl =
  ddbDataflowId => `GetMappingSetIdForDDBDataflow/${ddbDataflowId}`;

export const getCheckImportedFileCsvItemUrl = () => 'checkImportedFileCsvItem';
export const getImportFileCsvItemUrl = () => 'importFileCsvItem';

export const getShyncCodelistsUrl = () => 'syncCodelist';
export const getAllCodelistToBeSynchronizedUrl = () => 'getAllCodelistToBeSynchronized';

export const getDsdWithDataflowUrl = () => 'getDSDWithDataflow';
export const getAllUpgradableDsdUrl = dsdTriplet => 'getAllUpgradableDSD' + getArtefactUrl(dsdTriplet);
export const getUpgradeDsdUrl = () => 'upgradeDSD';

export const getGenerateReportDsdUrl = (sourceDsdTriplet, targetDsdTriplet, checkIfIsUpgradable) =>
  'generateReportDSD' + getArtefactUrl(sourceDsdTriplet) + getArtefactUrl(targetDsdTriplet) + (checkIfIsUpgradable ? '/true' : '/false');
export const getCompareDsdsUrl = () => 'compareDSD/true';
export const getGenerateFileReportDsdUrl = lang => 'generateFileReportDSD/' + lang;

export const getCompareCodelistUrl = (sourceCodelistTriplet, targetCodelistTriplet, sourceDsdFile, targetDsdFile) =>
  ((sourceDsdFile || targetDsdFile) ? "CompareCodelistMix" : "CompareCodelist") +
  getArtefactUrl(sourceCodelistTriplet) +
  getArtefactUrl(targetCodelistTriplet) +
  ((sourceDsdFile || targetDsdFile)
      ? `?sourceFile=${encodeURIComponent(sourceDsdFile || "NULL")}&targetFile=${encodeURIComponent(targetDsdFile || "NULL")}`
      : ""
  );

export const getCompareItemsUrl = (artefactType, sourceTriplet, targetTriplet) =>
  `compareItem/${artefactType}` +
  `?first=${sourceTriplet ? encodeURIComponent(`${sourceTriplet.id}+${sourceTriplet.agencyID}+${sourceTriplet.version}`) : ''}` +
  `&second=${targetTriplet ? encodeURIComponent(`${targetTriplet.id}+${targetTriplet.agencyID}+${targetTriplet.version}`) : ''}`;

export const getCompareItemsForFileUrl = (artefactType, lang, sourceTriplet, targetTriplet) =>
  `compareItemForFile/${artefactType}/${lang}` +
  `?first=${sourceTriplet ? encodeURIComponent(`${sourceTriplet.id}+${sourceTriplet.agencyID}+${sourceTriplet.version}`) : ''}` +
  `&second=${targetTriplet ? encodeURIComponent(`${targetTriplet.id}+${targetTriplet.agencyID}+${targetTriplet.version}`) : ''}`;

export const getMergeArtefactsUrl = (artefactType, sourceTriplet, targetTriplet) =>
  `mergeArtefact/${artefactType}` +
  `?first=${sourceTriplet ? encodeURIComponent(`${sourceTriplet.id}+${sourceTriplet.agencyID}+${sourceTriplet.version}`) : ''}` +
  `&second=${targetTriplet ? encodeURIComponent(`${targetTriplet.id}+${targetTriplet.agencyID}+${targetTriplet.version}`) : ''}`;

export const getMergeCodelistsUrl = (sourceTriplet, targetTriplet) =>
  `mergeCodelist/codelist` +
  `?first=${sourceTriplet ? encodeURIComponent(`${sourceTriplet.id}+${sourceTriplet.agencyID}+${sourceTriplet.version}`) : ''}` +
  `&second=${targetTriplet ? encodeURIComponent(`${targetTriplet.id}+${targetTriplet.agencyID}+${targetTriplet.version}`) : ''}`;
export const getMergedCodelistPageUrl = () => "NOSQL/searchmerge/codelist";
export const getSaveMergedCodelistUrl = lang => `saveMergeCodelist/${lang}`;

export const getXmlArtefactPreviewUrl = artefactType => `previewArtefact/${artefactType}`;
export const getXmlCodelistPreviewUrl = lang => `previewCodelist/${lang}`;

export const getUploadRMFileOnServerUrl = () => 'uploadReferenceMetadataFileOnServer';
export const getDownloadRMFileOnServerUrl = fileName => `referenceMetadataFileOnServer?filename=${encodeURIComponent(fileName)}`;

export const CONFIG_TYPE_APP = 'app';
export const CONFIG_TYPE_NODES = 'nodes';
export const getConfigUrl = configType => `configuration/${configType}`;
export const getAppConfigUrl = () => 'appConfig';
export const getNodePingUrl = () => 'ping';
export const getSaveConfigNodeUrl = (username, password) => 'Config/SaveNode/' + username + (password ? `/${encodeURIComponent(password)}` : '');
export const getDeleteConfigNodeUrl = nodeId => `/Config/DeleteNode/${nodeId}`;
export const getSortNodesUrl = () => 'Config/SortConfiguration';
export const getCheckEndpointNSIUrl = () => "Config/CheckEndPointNSI";
export const getCheckEndpointMAUrl = () => "Config/CheckEndPointMA";
export const getCheckEndpointDMUrl = () => "Config/CheckEndPointDM";
export const getCheckAgencyAssignedToAnyUserUrl = (agencyCode, nodeCode) => `IsAgencyAssignToAnyUser/${agencyCode}/${nodeCode}`;

/* AUTHENTICATION */
export const getLoginUrl = () => 'api/Security/Authenticate';
export const getLogoutUrl = () => 'api/Security/Logout';
export const getSuperUserLoginUrl = () => '/api/Security/LoginSuperUser';
export const getSuperUserLogoutUrl = () => '/api/Security/LogoutSuperUser';
export const getRecoverPasswordUrl = () => '/api/Security/RecoveryPassword';
export const getUpdateUserUrl = () => '/Config/UpdateUser';

/* PERMISSIONS */
export const getUsers = () => 'GetUsers';
export const getReadPermissionsUrl = username => `GetData${username ? `/${encodeURIComponent(username)}` : ''}`;
export const getAllAgenciesUrl = () => 'GetAllAgency';
export const getAllFunctionalitiesUrl = () => 'GetFunctionalityHierarchy';
export const getAllRulesUrl = () => 'GetAllRules';
export const getSubmitPermissionsUrl = () => 'AssignsAll';
export const getSynchronizeAuthDBUrl = () => 'SynchronizeAuthDB';
export const getCreateUserUrl = () => '/Config/CreateUser';
export const getDeleteUserUrl = username => `Config/DeleteUser/${username}`;

export const getCubeOwnersUrl = cubeId =>
  `GetOwners/Cube?id=${encodeURIComponent(cubeId)}`;
export const getDataflowOwnersUrl = dataflowTripletStr =>
  `GetOwners/Dataflow?id=${encodeURIComponent(dataflowTripletStr)}`;
export const getMetadataflowOwnersUrl = metadataflowTripletStr =>
  `GetOwners/MetadataFlow?id=${encodeURIComponent(metadataflowTripletStr)}`;
export const getSetOwnersUrl = () => "SetOwners";

/* UTILS */
export const getRemoveTempTablesUrl = () => 'Utils/RemoveTempTable';

export const getDisembargoCubeUrl = cubeId => `DisembargoCube/${cubeId}`;

export const getEmptyCubeUrl = cubeId => `EmptyCube/${cubeId}`;

export const getDdbResetUrl = () => "DDBReset";

export const getAddAgencyToConfigUrl = nodeId => `AddAgencyToConfig/${nodeId}`;
