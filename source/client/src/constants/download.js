import moment from "moment";
import {getStringFromArtefactTriplet} from "../utils/sdmxJson";

export const DOWNLOAD_FORMAT_TYPE_STRUCTURE = "structure";
export const DOWNLOAD_FORMAT_TYPE_STRUCTURE20 = "structure20";
export const DOWNLOAD_FORMAT_TYPE_CSV = "csv";
export const DOWNLOAD_FORMAT_TYPE_SDMXCSV = "sdmxcsv";
export const DOWNLOAD_FORMAT_TYPE_RTF = "rtf";
export const DOWNLOAD_FORMAT_TYPE_RDF = "rdf";
export const DOWNLOAD_FORMAT_TYPE_GENERIC = "genericdata";
export const DOWNLOAD_FORMAT_TYPE_GENERIC20 = "genericdata20";
export const DOWNLOAD_FORMAT_TYPE_COMPACT = "compactdata";
export const DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC = "structurespecificdata";
export const DOWNLOAD_FORMAT_TYPE_JSON = "jsondata";
export const DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM = "customcsv";

export const ARTEFACT_TYPE_CODELIST = "codelist";
export const ARTEFACT_TYPE_CATEGORY_SCHEME = "categoryScheme";
export const ARTEFACT_TYPE_CONCEPT_SCHEME = "conceptScheme";
export const ARTEFACT_TYPE_AGENCY_SCHEME = "agencyScheme";
export const ARTEFACT_TYPE_DATAFLOW = "dataflow";
export const ARTEFACT_TYPE_METADATAFLOW = "metadataflow";
export const ARTEFACT_TYPE_DSD = "dsd";
export const ARTEFACT_TYPE_MSD = "msd";
export const ARTEFACT_TYPE_HIERARCHICAL_CODELIST = "hierarchicalCodelist";
export const ARTEFACT_TYPE_CONTENT_CONSTRAINT = "contentConstraint";
export const ARTEFACT_TYPE_DDBDATAFLOW = "ddbdataflow";
export const ARTEFACT_TYPE_MULTIPLE = "multipleArtefacts";

export const getArtefactDownloadOptions = (t, artefactType) => {

  switch (artefactType) {
    case ARTEFACT_TYPE_CODELIST:
    case ARTEFACT_TYPE_CATEGORY_SCHEME:
    case ARTEFACT_TYPE_CONCEPT_SCHEME:
    case ARTEFACT_TYPE_AGENCY_SCHEME:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_CSV,
          label: t("data.artefact.downloadFormat.csv.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_RDF,
          label: t("data.artefact.downloadFormat.rdf.label")
        }
      ];
    case ARTEFACT_TYPE_DATAFLOW:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_RDF,
          label: t("data.artefact.downloadFormat.rdf.label")
        }
      ];
    case ARTEFACT_TYPE_METADATAFLOW:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        }
      ];
    case ARTEFACT_TYPE_DSD:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_RDF,
          label: t("data.artefact.downloadFormat.rdf.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_RTF,
          label: t("data.artefact.downloadFormat.rtf.label")
        }
      ];
    case ARTEFACT_TYPE_MSD:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        }
      ];
    case ARTEFACT_TYPE_HIERARCHICAL_CODELIST:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        }
      ];
    case ARTEFACT_TYPE_CONTENT_CONSTRAINT:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.json.label")
        }
      ];
    case ARTEFACT_TYPE_DDBDATAFLOW:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_GENERIC,
          label: t("data.artefact.downloadFormat.generic.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC,
          label: t("data.artefact.downloadFormat.structureSpecific.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_GENERIC20,
          label: t("data.artefact.downloadFormat.generic20.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_COMPACT,
          label: t("data.artefact.downloadFormat.compact.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_SDMXCSV,
          label: t("data.artefact.downloadFormat.sdmxCsv.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM,
          label: t("data.artefact.downloadFormat.csvCustom.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_JSON,
          label: t("data.artefact.downloadFormat.sdmxJson.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_RDF,
          label: t("data.artefact.downloadFormat.rdf.label")
        }
      ];
    case ARTEFACT_TYPE_MULTIPLE:
      return [
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE,
          label: t("data.artefact.downloadFormat.structure.label")
        },
        {
          key: DOWNLOAD_FORMAT_TYPE_STRUCTURE20,
          label: t("data.artefact.downloadFormat.structure20.label")
        },
      ];
    default:
      return []
  }
};

const getArtefactDownloadExtension = (artefactFormat, isCompressed) => {

  if (isCompressed) {
    return "zip"
  }

  switch (artefactFormat) {
    case DOWNLOAD_FORMAT_TYPE_STRUCTURE:
    case DOWNLOAD_FORMAT_TYPE_STRUCTURE20:
    case DOWNLOAD_FORMAT_TYPE_GENERIC:
    case DOWNLOAD_FORMAT_TYPE_GENERIC20:
    case DOWNLOAD_FORMAT_TYPE_COMPACT:
    case DOWNLOAD_FORMAT_TYPE_STRUCTURE_SPECIFIC:
      return "xml";
    case DOWNLOAD_FORMAT_TYPE_CSV:
    case DOWNLOAD_FORMAT_TYPE_CSV_CUSTOM:
    case DOWNLOAD_FORMAT_TYPE_SDMXCSV:
      return "csv";
    case DOWNLOAD_FORMAT_TYPE_RTF:
      return "rtf";
    case DOWNLOAD_FORMAT_TYPE_RDF:
      return "rdf";
    case DOWNLOAD_FORMAT_TYPE_JSON:
      return "json";
    default:
      return artefactFormat
  }
};

export const getArtefactDownloadFileSaveNameAndType = (artefactTriplets, artefactType, artefactFormat, isCompressed, lang) => {
  const currDate = moment().format('YYYY-MM-DD_HH-mm-ss');
  let ext = getArtefactDownloadExtension(artefactFormat, isCompressed);

  return {
    name: (artefactTriplets && artefactTriplets.length > 1)
      ? `${artefactType}s_${currDate}.${ext}`
      : (
        `${getStringFromArtefactTriplet(artefactTriplets[0])}` +
        `${artefactType === ARTEFACT_TYPE_DDBDATAFLOW ? `_${currDate}` : ''}` +
        `${artefactFormat === DOWNLOAD_FORMAT_TYPE_CSV ? `_${lang.toUpperCase()}` : ''}` +
        `.${ext}`
      ),
    type: isCompressed
      ? "application/zip"
      : "text/plain;charset=utf-8"
  }
};