import {REQUEST_SUCCESS} from "../api/actions";
import FileSaver from "file-saver";
import {CUBE_LIST_CUBE_DOWNLOAD_CSV_READ} from "../../scenes/data-manager/cube-list/actions";
import {CODELIST_DETAIL_DOWNLOAD_SUBMIT} from "../../redux-components/redux-codelist-detail-modal/actions";
import {CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT} from "../../redux-components/redux-category-scheme-detail-modal/actions";
import {CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT} from "../../redux-components/redux-concept-scheme-detail-modal/actions";
import {DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT} from "../../scenes/meta-manager/dataflows/actions";
import {DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD} from "../../scenes/data-manager/dataflow-builder/list/actions";
import {DSD_DETAIL_DOWNLOAD_SUBMIT} from "../../redux-components/redux-dsd-detail-modal/actions";
import {MSDS_MSD_DOWNLOAD} from "../../scenes/meta-manager/msds/actions";
import {METADATAFLOWS_METADATAFLOW_DOWNLOAD} from "../../scenes/meta-manager/metadataflows/actions";
import {AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD} from "../../scenes/meta-manager/agency-schemes/actions";
import {CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT} from "../../redux-components/redux-content-constraint-modal/actions";
import {COMPARE_DSDS_REPORT_DOWNLOAD} from "../../scenes/utilities/compare-dsds/actions";
import {COMPARE_ITEM_SCHEMES_COMPARE_DOWNLOAD} from "../../scenes/utilities/compare-item-schemes/actions";
import {UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_DOWNLOAD} from "../../scenes/data-manager/upgrade-dsd/actions";
import {
  METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD,
  METADATA_SET_REPORT_DOWNLOAD
} from "../../scenes/reference-metadata/metadata-set/actions";
import {
  DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD,
  DCAT_REPORT_DOWNLOAD
} from "../../scenes/reference-metadata/dcat/actions";
import {HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD} from "../../scenes/meta-manager/hierarchical-codelists/actions";

const fileSaveMiddleware = () => next => action => {

  const result = next(action);

  if (action.type === REQUEST_SUCCESS && action.fileSave) {
    if (action.label === CUBE_LIST_CUBE_DOWNLOAD_CSV_READ ||
      action.label.endsWith(CODELIST_DETAIL_DOWNLOAD_SUBMIT) ||
      action.label.endsWith(CATEGORY_SCHEME_DETAIL_DOWNLOAD_SUBMIT) ||
      action.label.endsWith(CONCEPT_SCHEME_DETAIL_DOWNLOAD_SUBMIT) ||
      action.label === AGENCY_SCHEMES_AGENCY_SCHEME_DOWNLOAD ||
      action.label === DATAFLOWS_DATAFLOW_DOWNLOAD_SUBMIT ||
      action.label === DATAFLOW_BUILDER_LIST_DATAFLOW_DOWNLOAD ||
      action.label.endsWith(DSD_DETAIL_DOWNLOAD_SUBMIT) ||
      action.label === MSDS_MSD_DOWNLOAD ||
      action.label === METADATAFLOWS_METADATAFLOW_DOWNLOAD ||
      action.label.endsWith(CONTENT_CONSTRAINT_DETAIL_DOWNLOAD_SUBMIT) ||
      action.label === COMPARE_DSDS_REPORT_DOWNLOAD ||
      action.label === COMPARE_ITEM_SCHEMES_COMPARE_DOWNLOAD ||
      action.label === UPGRADE_DSD_IMPORT_DSD_DSDS_COMPARE_DOWNLOAD ||
      action.label === METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD ||
      action.label === DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD ||
      action.label === HIERARCHICAL_CODELISTS_HIERARCHICAL_CODELIST_DOWNLOAD ||
      action.label === METADATA_SET_REPORT_DOWNLOAD ||
      action.label === DCAT_REPORT_DOWNLOAD
    ) {

      let name = action.fileSave.name;

      if (action.label !== METADATA_SET_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD &&
        action.label !== DCAT_REPORT_ATTRIBUTE_ATTACHMENT_DOWNLOAD) {

        if (!name.endsWith("zip") && action.header && action.header["content-type"] === "application/zip") {
          name = action.fileSave.name.split(".");
          name.pop();
          name.push("zip");
          name = name.join(".");
        }
      }

      FileSaver.saveAs(
        new Blob(
          [!action.fileSave.stringifyResponse ? action.response : JSON.stringify(action.response)],
          {type: action.fileSave.type}
        ),
        name
      )
    }
  }

  return result;

};

export default fileSaveMiddleware;
