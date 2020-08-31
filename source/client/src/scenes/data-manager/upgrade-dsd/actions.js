import {getRequest, postRequest} from "../../../middlewares/api/actions";
import {
  getAllUpgradableDsdUrl,
  getCheckImportedFileXmlSdmxObjectsUrl,
  getCompareCodelistUrl,
  getCompareDsdsUrl,
  getDsdWithDataflowUrl,
  getGenerateFileReportDsdUrl,
  getGenerateReportDsdUrl,
  getImportFileXmlSdmxObjectsUrl,
  getUpgradeDsdUrl
} from "../../../constants/urls";
import moment from "moment";

export const UPGRADE_DSD_DSDS_READ = "UPGRADE_DSD_DSDS_READ";

export const UPGRADE_DSD_UPGRADED_DSDS_SHOW = 'UPGRADE_DSD_UPGRADED_DSDS_SHOW';
export const UPGRADE_DSD_UPGRADED_DSDS_READ = 'UPGRADE_DSD_UPGRADED_DSDS_READ';
export const UPGRADE_DSD_UPGRADED_DSDS_HIDE = 'UPGRADE_DSD_UPGRADED_DSDS_HIDE';

export const UPGRADE_DSD_DSDS_COMPARE = 'UPGRADE_DSD_DSDS_COMPARE';
export const UPGRADE_DSD_DSDS_COMPARE_HIDE = 'UPGRADE_DSD_DSDS_COMPARE_HIDE';

export const UPGRADE_DSD_DSD_UPGRADE_SHOW = 'UPGRADE_DSD_DSD_UPGRADE_SHOW';
export const UPGRADE_DSD_DSD_UPGRADE = 'UPGRADE_DSD_DSD_UPGRADE';
export const UPGRADE_DSD_DSD_UPGRADE_HIDE = 'UPGRADE_DSD_DSD_UPGRADE_HIDE';

export const UPGRADE_DSD_DATAFLOWS_SHOW = 'UPGRADE_DSD_DATAFLOWS_SHOW';
export const UPGRADE_DSD_DATAFLOWS_HIDE = 'UPGRADE_DSD_DATAFLOWS_HIDE';

export const UPGRADE_DSD_CODELIST_COMPARE_REPORT_READ = 'UPGRADE_DSD_CODELIST_COMPARE_REPORT_READ';
export const UPGRADE_DSD_CODELIST_COMPARE_REPORT_HIDE = 'UPGRADE_DSD_CODELIST_COMPARE_REPORT_HIDE';

export const UPGRADE_DSD_IMPORT_DSD_SHOW = 'UPGRADE_DSD_IMPORT_DSD_SHOW';
export const UPGRADE_DSD_IMPORT_DSD_HIDE = 'UPGRADE_DSD_IMPORT_DSD_HIDE';

export const UPGRADE_DSD_IMPORT_DSD_FILE_SET = 'UPGRADE_DSD_IMPORT_DSD_FILE_SET';

export const UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT = 'UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT';
export const UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_DOWNLOAD = 'UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_DOWNLOAD';

export const UPGRADE_DSD_IMPORT_DSD_IMPORT_START = 'UPGRADE_DSD_IMPORT_DSD_IMPORT_START';
export const UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD = 'UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD';
export const UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT = 'UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT';
export const UPGRADE_DSD_IMPORT_DSD_REPORT_HIDE = 'UPGRADE_DSD_IMPORT_DSD_REPORT_HIDE';

export const readUpgradeDsdDsds = () => getRequest(
  UPGRADE_DSD_DSDS_READ,
  getDsdWithDataflowUrl()
);

export const showUpgradeDsdUpgradedDsds = dsdTriplet => ({
  type: UPGRADE_DSD_UPGRADED_DSDS_SHOW,
  dsdTriplet
});

export const hideUpgradeDsdUpgradedDsds = () => ({
  type: UPGRADE_DSD_UPGRADED_DSDS_HIDE
});

export const readUpgradeDsdUpgradedDsds = dsdTriplet => ({
  ...getRequest(
    UPGRADE_DSD_UPGRADED_DSDS_READ,
    getAllUpgradableDsdUrl(dsdTriplet)
  )
});

export const compareUpgradeDsdDsds = (sourceDsdTriplet, targetDsdTriplet, showModal) => ({
  ...getRequest(
    UPGRADE_DSD_DSDS_COMPARE,
    getGenerateReportDsdUrl(sourceDsdTriplet, targetDsdTriplet, true)
  ),
  showModal,
  targetDsdTriplet
});

export const hideUpgradeDsdDsdsCompare = () => ({
  type: UPGRADE_DSD_DSDS_COMPARE_HIDE
});

export const showUpgradeDsdDsdUpgrade = dsdTriplet => ({
  type: UPGRADE_DSD_DSD_UPGRADE_SHOW,
  dsdTriplet
});

export const upgradeUpgradeDsdDsd = report => postRequest(
  UPGRADE_DSD_DSD_UPGRADE,
  getUpgradeDsdUrl(),
  report
);

export const hideUpgradeDsdDsdUpgrade = success => ({
  type: UPGRADE_DSD_DSD_UPGRADE_HIDE,
  success
});

export const showUpgradeDsdDataflows = dataflows => ({
  type: UPGRADE_DSD_DATAFLOWS_SHOW,
  dataflows
});

export const hideUpgradeDsdDataflows = () => ({
  type: UPGRADE_DSD_DATAFLOWS_HIDE
});

export const readUpgradeDsdCodelistCompareReport = (sourceTriplet, targetTriplet) => ({
  ...getRequest(
    UPGRADE_DSD_CODELIST_COMPARE_REPORT_READ,
    getCompareCodelistUrl(sourceTriplet, targetTriplet)
  ),
  targetTriplet
});

export const hideUpgradeDsdCodelistCompareReport = () => ({
  type: UPGRADE_DSD_CODELIST_COMPARE_REPORT_HIDE
});

export const showUpgradeDsdImportDsd = () => ({
  type: UPGRADE_DSD_IMPORT_DSD_SHOW
});

export const hideUpgradeDsdImportDsd = () => ({
  type: UPGRADE_DSD_IMPORT_DSD_HIDE
});

export const setUpgradeDsdImportDsdFile = file => ({
  type: UPGRADE_DSD_IMPORT_DSD_FILE_SET,
  file
});

export const submitUpgradeDsdImportDsdDsdsCompare = (srcTriplet, targetFile, showModal) => {

  const customData = {
    sourceArtefact: srcTriplet
      ? {
        ID: srcTriplet.id,
        Agency: srcTriplet.agencyID,
        Version: srcTriplet.version,
        StreamType: 'Database'
      }
      : {
        StreamType: 'Xml'
      },
    targetArtefact: {
      StreamType: 'Xml'
    }
  };

  let fileFormData = new FormData();
  fileFormData.append('Files', targetFile);
  fileFormData.append('CustomData', JSON.stringify(customData));

  return {
    ...postRequest(
      UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_SUBMIT,
      getCompareDsdsUrl(),
      fileFormData
    ),
    showModal
  }
};

export const downloadUpgradeDsdImportDsdDsdsCompare = (srcTriplet, targetTriplet, targetFile, lang) => {
  const currDate = moment().format('YYYY-MM-DD_HH-mm-ss');

  const fileSave = {
    name: `CompareDsds_${currDate}.txt`,
    type: "text/plain;charset=utf-8"
  };

  const customData = {
    sourceArtefact: {
      ID: srcTriplet.id,
      Agency: srcTriplet.agencyID,
      Version: srcTriplet.version,
      StreamType: 'Database'
    },
    targetArtefact: targetTriplet
      ? {
        ID: targetTriplet.id,
        Agency: targetTriplet.agencyID,
        Version: targetTriplet.version,
        StreamType: 'Database'
      }
      : {
        StreamType: 'Xml'
      }
  };

  let fileFormData = new FormData();
  if (targetFile !== null) {
    fileFormData.append('Files', targetFile);
  }
  fileFormData.append('CustomData', JSON.stringify(customData));

  return {
    ...postRequest(
      UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_DOWNLOAD,
      getGenerateFileReportDsdUrl(lang),
      fileFormData,
      undefined,
      undefined,
      true
    ),
    fileSave
  };
};

export const startUpgradeDsdImportDsdImport = () => ({
  type: UPGRADE_DSD_IMPORT_DSD_IMPORT_START
});

export const uploadUpgradeDsdImportDsdFile = file => {
  let fileFormData = new FormData();
  fileFormData.append('file', file);
  return postRequest(
    UPGRADE_DSD_IMPORT_DSD_FILE_UPLOAD,
    getCheckImportedFileXmlSdmxObjectsUrl(),
    fileFormData,
    t => ({
      success: t('scenes.utilities.importStructures.messages.fileUpload.success')
    })
  );
};

export const submitUpgradeDsdImportDsdFile = (structures, hash) => postRequest(
  UPGRADE_DSD_IMPORT_DSD_FILE_SUBMIT,
  getImportFileXmlSdmxObjectsUrl(),
  {
    importedItem: structures,
    hashImport: hash
  }
);

export const hideUpgradeDsdImportDsdReport = () => ({
  type: UPGRADE_DSD_IMPORT_DSD_REPORT_HIDE
});