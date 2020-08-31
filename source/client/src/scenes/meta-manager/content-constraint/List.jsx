import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  deleteContentConstraintsContentConstraint,
  deleteContentConstraintsSelectedContentConstraints,
  hideContentConstraintsContentConstraintParentsAndChildren,
  hideContentConstraintsDetailAnnotations,
  readContentConstraintsContentConstraintParentsAndChildren,
  readContentConstraintsListContentConstraints,
  showContentConstraintsDetailAnnotations
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import {
  getArtefactTripletFromString,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_DATAFLOW_URN_NAMESPACE,
  SDMX_JSON_DSD_URN_NAMESPACE
} from "../../../utils/sdmxJson";
import {reuseAction} from "../../../utils/reduxReuse";
import {MM_CONTENT_CONSTRAINTS_PREFIX} from "./reducer";
import {
  createContentConstraintDetail,
  editContentConstraintDetail,
  showContentConstraintDetailClone,
  showContentConstraintDetailDownload,
  showContentConstraintDetailExport
} from "../../../redux-components/redux-content-constraint-modal/actions";
import {ARTEFACT_TYPE_DSD} from "../../../constants/download";

const mapStateToProps = state => ({
  contentConstraints: state.scenes.metaManager.contentConstraints.contentConstraints,
  contentConstraintDetail: state.scenes.metaManager.contentConstraints.contentConstraintDetail,
  contentConstraintAnnotations: state.scenes.metaManager.contentConstraints.contentConstraintAnnotations,
  contentConstraintAnnotationTriplet: state.scenes.metaManager.contentConstraints.contentConstraintAnnotationTriplet,
  parentsAndChildren: state.scenes.metaManager.contentConstraints.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  fetchContentConstraints: () => dispatch(readContentConstraintsListContentConstraints()),
  onCreateShow: () => dispatch(reuseAction(createContentConstraintDetail(), MM_CONTENT_CONSTRAINTS_PREFIX)),
  onDetailShow: (contentConstraintTriplet) => dispatch(reuseAction(editContentConstraintDetail(contentConstraintTriplet), MM_CONTENT_CONSTRAINTS_PREFIX)),
  onContentConstraintDelete: contentConstraintTriplet => dispatch(deleteContentConstraintsContentConstraint(contentConstraintTriplet)),
  onSelectedContentConstraintsDelete: contentConstraintTriplets => dispatch(deleteContentConstraintsSelectedContentConstraints(contentConstraintTriplets)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showContentConstraintsDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideContentConstraintsDetailAnnotations()),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showContentConstraintDetailDownload(artefactTriplets, lang), MM_CONTENT_CONSTRAINTS_PREFIX)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showContentConstraintDetailClone(artefactTriplet), MM_CONTENT_CONSTRAINTS_PREFIX)),
  onExportShow: (sourceTriplet, sourceAttachmentType, sourceAttachmentUrn, sourceFilter) =>
    dispatch(reuseAction(showContentConstraintDetailExport(sourceTriplet, sourceAttachmentType, sourceAttachmentUrn, sourceFilter), MM_CONTENT_CONSTRAINTS_PREFIX)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readContentConstraintsContentConstraintParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideContentConstraintsContentConstraintParentsAndChildren())
});

const ContentConstraintsList = ({
                                  contentConstraints,
                                  contentConstraintDetail,
                                  onCreateShow,
                                  onDetailShow,
                                  fetchContentConstraints,
                                  onContentConstraintDelete,
                                  contentConstraintAnnotations,
                                  contentConstraintAnnotationTriplet,
                                  onAnnotationsShow,
                                  onAnnotationsHide,
                                  onSelectedContentConstraintsDelete,
                                  onDownloadShow,
                                  onCloneShow,
                                  onExportShow,
                                  parentsAndChildren,
                                  fetchParentsAndChildren,
                                  onParentsAndChildrenHide
                                }) => {
  return (
    <Call cb={fetchContentConstraints} disabled={contentConstraints !== null}>
      <ArtefactList
        artefacts={contentConstraints}
        onDetailShow={onDetailShow}
        onCreate={onCreateShow}
        onDownloadShow={onDownloadShow}
        onCloneShow={onCloneShow}
        onExportShow={triplet => onExportShow(
          triplet,
          contentConstraintDetail.artefactType,
          getUrnFromArtefactTriplet(
            getArtefactTripletFromString(contentConstraintDetail.artefactTriplet || ""),
            contentConstraintDetail.artefactType === ARTEFACT_TYPE_DSD
              ? SDMX_JSON_DSD_URN_NAMESPACE
              : SDMX_JSON_DATAFLOW_URN_NAMESPACE
          ),
          contentConstraintDetail.filter
        )}
        onDelete={onContentConstraintDelete}
        onSelectedItemDelete={onSelectedContentConstraintsDelete}
        onAnnotationsShow={onAnnotationsShow}
        parentsAndChildren={parentsAndChildren}
        fetchParentsAndChildren={triplet => fetchParentsAndChildren("contentconstraint", triplet)}
        onParentsAndChildrenHide={onParentsAndChildrenHide}
      />
      <CustomAnnotationList
        annotations={contentConstraintAnnotations}
        onClose={onAnnotationsHide}
        title={contentConstraintAnnotationTriplet
          ? getStringFromArtefactTriplet(contentConstraintAnnotationTriplet)
          : null
        }
      />
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ContentConstraintsList);
