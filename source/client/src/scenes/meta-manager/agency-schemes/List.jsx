import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  createAgencySchemesAgencyScheme,
  deleteAgencySchemesAgencyScheme,
  deleteAgencySchemesSelectedAgencySchemes,
  editAgencySchemesAgencyScheme,
  hideAgencySchemesDetailAnnotations,
  readAgencySchemesListAgencySchemes,
  showAgencySchemesAgencySchemeClone,
  showAgencySchemesAgencySchemeDownload,
  showAgencySchemesAgencySchemeExport,
  showAgencySchemesDetailAnnotations,
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  agencySchemes: state.scenes.metaManager.agencySchemes.agencySchemes,
  agencySchemeAnnotations: state.scenes.metaManager.agencySchemes.agencySchemeAnnotations,
  agencySchemeAnnotationTriplet: state.scenes.metaManager.agencySchemes.agencySchemeAnnotationTriplet
});

const mapDispatchToProps = dispatch => ({
  onCreate: defaultItemsViewMode => dispatch(createAgencySchemesAgencyScheme(defaultItemsViewMode)),
  onDetail: (agencySchemeTriplet, defaultItemsViewMode) =>
    dispatch(editAgencySchemesAgencyScheme(agencySchemeTriplet, defaultItemsViewMode)),
  fetchAgencySchemes: () => dispatch(readAgencySchemesListAgencySchemes()),
  onAgencySchemeDelete: agencySchemeTriplet => dispatch(deleteAgencySchemesAgencyScheme(agencySchemeTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showAgencySchemesDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideAgencySchemesDetailAnnotations()),
  onSelectedAgencySchemesDelete: agencySchemeTriplets =>
    dispatch(deleteAgencySchemesSelectedAgencySchemes(agencySchemeTriplets)),
  onDownloadShow: (artefactTriplets, lang) =>
    dispatch(showAgencySchemesAgencySchemeDownload(artefactTriplets, lang)),
  onCloneShow: artefactTriplet => dispatch(showAgencySchemesAgencySchemeClone(artefactTriplet)),
  onExportShow: artefactTriplet => dispatch(showAgencySchemesAgencySchemeExport(artefactTriplet))
});

const AgencySchemesList = ({
                             nodeId,
                             nodes,
                             agencySchemes,
                             onCreate,
                             onDetail,
                             fetchAgencySchemes,
                             onAgencySchemeDelete,
                             agencySchemeAnnotations,
                             agencySchemeAnnotationTriplet,
                             onAnnotationsShow,
                             onAnnotationsHide,
                             onSelectedAgencySchemesDelete,
                             onDownloadShow,
                             onCloneShow,
                             onExportShow
                           }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Call cb={fetchAgencySchemes} disabled={agencySchemes !== null}>
      <ArtefactList
        artefacts={agencySchemes}
        onCreate={() => onCreate(defaultItemsViewMode)}
        onDetailShow={triplet => onDetail(triplet, defaultItemsViewMode)}
        onDownloadShow={onDownloadShow}
        onCloneShow={onCloneShow}
        onExportShow={onExportShow}
        onDelete={onAgencySchemeDelete}
        onSelectedItemDelete={onSelectedAgencySchemesDelete}
        onAnnotationsShow={onAnnotationsShow}
      />
      <CustomAnnotationList
        annotations={agencySchemeAnnotations}
        onClose={onAnnotationsHide}
        title={agencySchemeAnnotationTriplet
          ? getStringFromArtefactTriplet(agencySchemeAnnotationTriplet)
          : null
        }
      />
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AgencySchemesList);
