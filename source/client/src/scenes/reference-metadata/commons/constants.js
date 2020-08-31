import {
  getCategorySchemeUrl,
  getCodelistUrl,
  getConceptSchemeUrl,
  getDataflowUrl,
  getMetadataflowUrl
} from "../../../constants/urls";
import {
  getArtefactTripletFromUrn,
  SDMX_JSON_CATEGORY_SCHEME_URN_NAMESPACE,
  SDMX_JSON_CODELIST_URN_NAMESPACE,
  SDMX_JSON_CONCEPT_SCEHME_URN_NAMESPACE,
  SDMX_JSON_DATAFLOW_URN_NAMESPACE,
  SDMX_JSON_METADATAFLOW_URN_NAMESPACE
} from "../../../utils/sdmxJson";

export const REPORT_DETAILS_WIZARD_STEP_FIRST = 0;
export const REPORT_DETAILS_WIZARD_STEP_SECOND = 1;

export const ARTEFACT_TYPES = [
  {
    type: "codelist",
    url: getCodelistUrl(),
    urnNamespace: SDMX_JSON_CODELIST_URN_NAMESPACE
  },
  {
    type: "categoryscheme",
    url: getCategorySchemeUrl(),
    urnNamespace: SDMX_JSON_CATEGORY_SCHEME_URN_NAMESPACE
  },
  {
    type: "conceptscheme",
    url: getConceptSchemeUrl(),
    urnNamespace: SDMX_JSON_CONCEPT_SCEHME_URN_NAMESPACE
  },
  {
    type: "dataflow",
    url: getDataflowUrl(),
    urnNamespace: SDMX_JSON_DATAFLOW_URN_NAMESPACE
  },
  {
    type: "metadataflow",
    url: getMetadataflowUrl(),
    urnNamespace: SDMX_JSON_METADATAFLOW_URN_NAMESPACE
  }
];

const AUTO_ANNOTATIONS = [
  "metadatasetid",
  "metadataflowcategorylist",
  "metadataflowid",
  "metadataflowagency",
  "metadataflowversion",
  "msdid",
  "msdagency",
  "msdversion"
];

export const customIsReferenceMetadataAutoAnnotation = annotation =>
  annotation.id && (AUTO_ANNOTATIONS.includes(annotation.id.toLowerCase()) || annotation.id.substring(0, 14) === "categorisation");

export const getWorkingAnnotations = metadataSet => {
  const metadataflowTriplet = metadataSet.metadataflowTriplet;
  const msdTriplet = getArtefactTripletFromUrn(metadataSet.structureRef);

  return [
    {
      id: "MetadataflowId",
      text: {
        en: metadataflowTriplet.id
      }
    },
    {
      id: "MetadataflowAgency",
      text: {
        en: metadataflowTriplet.agencyID
      }
    },
    {
      id: "MetadataflowVersion",
      text: {
        en: metadataflowTriplet.version
      }
    },
    {
      id: "MSDId",
      text: {
        en: msdTriplet.id
      }
    },
    {
      id: "MSDAgency",
      text: {
        en: msdTriplet.agencyID
      }
    },
    {
      id: "MSDVersion",
      text: {
        en: msdTriplet.version
      }
    }
  ]
};