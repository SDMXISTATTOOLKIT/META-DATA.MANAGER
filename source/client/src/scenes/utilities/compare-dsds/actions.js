import {getRequest, postRequest} from "../../../middlewares/api/actions";
import {
  getCompareCodelistUrl,
  getCompareDsdsUrl,
  getDsdUrl,
  getGenerateFileReportDsdUrl
} from "../../../constants/urls";
import moment from "moment"

export const COMPARE_DSDS_SRC_DSDS_SHOW = 'COMPARE_DSDS_SRC_DSDS_SHOW';
export const COMPARE_DSDS_SRC_DSDS_HIDE = 'COMPARE_DSDS_SRC_DSDS_HIDE';
export const COMPARE_DSDS_SRC_DSDS_READ = 'COMPARE_DSDS_SRC_DSDS_READ';
export const COMPARE_DSDS_SRC_TRIPLET_SET = 'COMPARE_DSDS_SRC_TRIPLET_SET';
export const COMPARE_DSDS_SRC_TRIPLET_RESET = 'COMPARE_DSDS_SRC_TRIPLET_RESET';

export const COMPARE_DSDS_TARGET_DSDS_SHOW = 'COMPARE_DSDS_TARGET_DSDS_SHOW';
export const COMPARE_DSDS_TARGET_DSDS_HIDE = 'COMPARE_DSDS_TARGET_DSDS_HIDE';
export const COMPARE_DSDS_TARGET_DSDS_READ = 'COMPARE_DSDS_TARGET_DSDS_READ';
export const COMPARE_DSDS_TARGET_TRIPLET_SET = 'COMPARE_DSDS_TARGET_TRIPLET_SET';
export const COMPARE_DSDS_TARGET_TRIPLET_RESET = 'COMPARE_DSDS_TARGET_TRIPLET_RESET';

export const COMPARE_DSDS_REPORT_READ = 'COMPARE_DSDS_REPORT_READ';

export const COMPARE_DSDS_REPORT_DOWNLOAD = 'COMPARE_DSDS_REPORT_DOWNLOAD';

export const COMPARE_DSDS_CODELIST_COMPARE_REPORT_READ = 'COMPARE_DSDS_CODELIST_COMPARE_REPORT_READ';
export const COMPARE_DSDS_CODELIST_COMPARE_REPORT_HIDE = 'COMPARE_DSDS_CODELIST_COMPARE_REPORT_HIDE';

export const COMPARE_DSDS_DSD_SOURCE_CHANGE = 'COMPARE_DSDS_DSD_SOURCE_CHANGE';
export const COMPARE_DSDS_DSD_FILE_SET = 'COMPARE_DSDS_DSD_FILE_SET';

export const showCompareDsdsSrcDsds = () => ({
  type: COMPARE_DSDS_SRC_DSDS_SHOW
});

export const showCompareDsdsTargetDsds = () => ({
  type: COMPARE_DSDS_TARGET_DSDS_SHOW
});

export const hideCompareDsdsSrcDsds = () => ({
  type: COMPARE_DSDS_SRC_DSDS_HIDE
});

export const hideCompareDsdsTargetDsds = () => ({
  type: COMPARE_DSDS_TARGET_DSDS_HIDE
});

export const readCompareDsdsSrcDsds = () => getRequest(
  COMPARE_DSDS_SRC_DSDS_READ,
  getDsdUrl()
);

export const readCompareDsdsTargetDsds = () => getRequest(
  COMPARE_DSDS_TARGET_DSDS_READ,
  getDsdUrl()
);

export const setCompareDsdsSrcTriplet = srcTriplet => ({
  type: COMPARE_DSDS_SRC_TRIPLET_SET,
  srcTriplet
});

export const resetCompareDsdsSrcTriplet = () => ({
  type: COMPARE_DSDS_SRC_TRIPLET_RESET
});

export const setCompareDsdsTargetTriplet = targetTriplet => ({
  type: COMPARE_DSDS_TARGET_TRIPLET_SET,
  targetTriplet
});

export const resetCompareDsdsTargetTriplet = () => ({
  type: COMPARE_DSDS_TARGET_TRIPLET_RESET
});

export const readCompareDsdsReport = (srcTriplet, targetTriplet, srcFile, targetFile) => {

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
  if (srcFile !== null) {
    fileFormData.append('Files', srcFile);
  }
  if (targetFile !== null) {
    fileFormData.append('Files', targetFile);
  }
  fileFormData.append('CustomData', JSON.stringify(customData));

  return postRequest(
    COMPARE_DSDS_REPORT_READ,
    getCompareDsdsUrl(),
    fileFormData
  )
};

export const readCompareDsdsCodelistCompareReport = (srcTriplet, targetTriplet, srcFile, targetFile) => getRequest(
  COMPARE_DSDS_CODELIST_COMPARE_REPORT_READ,
  getCompareCodelistUrl(srcTriplet, targetTriplet, srcFile, targetFile)
);

export const hideCompareDsdsCodelistCompareReport = () => ({
  type: COMPARE_DSDS_CODELIST_COMPARE_REPORT_HIDE,
});

export const downloadCompareDsdsReport = (srcTriplet, targetTriplet, srcFile, targetFile, lang) => {
  const currDate = moment().format('YYYY-MM-DD_HH-mm-ss');

  const fileSave = {
    name: `CompareDsds_${currDate}.txt`,
    type: "text/plain;charset=utf-8"
  };

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
  if (srcFile !== null) {
    fileFormData.append('Files', srcFile);
  }
  if (targetFile !== null) {
    fileFormData.append('Files', targetFile);
  }
  fileFormData.append('CustomData', JSON.stringify(customData));

  return {
    ...postRequest(
      COMPARE_DSDS_REPORT_DOWNLOAD,
      getGenerateFileReportDsdUrl(lang),
      fileFormData,
      undefined,
      undefined,
      true
    ),
    fileSave
  };
};

export const changeCompareDsdsDsdSource = (source, isSrc) => ({
  type: COMPARE_DSDS_DSD_SOURCE_CHANGE,
  source,
  isSrc
});

export const setCompareDsdsDsdFile = (file, isSrc) => ({
  type: COMPARE_DSDS_DSD_FILE_SET,
  file,
  isSrc
});
