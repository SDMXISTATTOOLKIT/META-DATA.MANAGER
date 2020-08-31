import React from "react";
import {translate} from 'react-i18next';
import {
  deleteDsdsListDsd,
  deleteDsdsListSelectedDsds,
  hideDsdsDetailItemsImportFormAllCsvRows,
  hideDsdsListDsdAnnotations,
  hideDsdsListDsdLayoutAnnotations,
  readDsdsDetailItemsImportFormAllCsvRows,
  readDsdsListDsds,
  showDsdsListDsdAnnotations,
  showDsdsListDsdLayoutAnnotations
} from "./actions";
import Call from "../../../hocs/call";
import {connect} from "react-redux";
import {compose} from "redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import LayoutAnnotationList from "../../../components/layout-annotation-list";
import {reuseAction} from "../../../utils/reduxReuse";
import {
  createDsdDetail,
  editDsdDetail,
  showDsdDetailClone,
  showDsdDetailDownload,
  showDsdDetailDsdExport
} from "../../../redux-components/redux-dsd-detail-modal/actions";
import {MM_DSDS_PREFIX} from "./reducer";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  dsds: state.scenes.metaManager.dsds.dsds,
  dsdAnnotations: state.scenes.metaManager.dsds.dsdAnnotations,
  dsdLayoutAnnotations: state.scenes.metaManager.dsds.dsdLayoutAnnotations,
  dsdAnnotationTriplet: state.scenes.metaManager.dsds.dsdAnnotationTriplet,
  parentsAndChildren: state.scenes.metaManager.dsds.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  fetchDsds: () => dispatch(readDsdsListDsds()),
  onCreate: () => dispatch(reuseAction(createDsdDetail(), MM_DSDS_PREFIX)),
  onDetail: dsdTriplet => dispatch(reuseAction(editDsdDetail(dsdTriplet), MM_DSDS_PREFIX)),
  onDsdDelete: dsdTriplet => dispatch(deleteDsdsListDsd(dsdTriplet)),
  onDownloadShow: (dsdTriplets, lang) => dispatch(reuseAction(showDsdDetailDownload(dsdTriplets, lang), MM_DSDS_PREFIX)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showDsdDetailClone(artefactTriplet), MM_DSDS_PREFIX)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showDsdDetailDsdExport(sourceTriplet), MM_DSDS_PREFIX)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showDsdsListDsdAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideDsdsListDsdAnnotations()),
  onLayoutAnnotationsShow: (annotations, triplet) => dispatch(showDsdsListDsdLayoutAnnotations(annotations, triplet)),
  onLayoutAnnotationsHide: () => dispatch(hideDsdsListDsdLayoutAnnotations()),
  onSelectedDsdDelete: dsdTriplets => dispatch(deleteDsdsListSelectedDsds(dsdTriplets)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) => dispatch(readDsdsDetailItemsImportFormAllCsvRows(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideDsdsDetailItemsImportFormAllCsvRows())
});

const DsdsList = ({
                    dsds,
                    dsdAnnotations,
                    dsdLayoutAnnotations,
                    dsdAnnotationTriplet,
                    fetchDsds,
                    onCreate,
                    onDetail,
                    onDownloadShow,
                    onCloneShow,
                    onExportShow,
                    onDsdDelete,
                    onAnnotationsShow,
                    onAnnotationsHide,
                    onLayoutAnnotationsShow,
                    onLayoutAnnotationsHide,
                    onSelectedDsdDelete,
                    parentsAndChildren,
                    fetchParentsAndChildren,
                    onParentsAndChildrenHide
                  }) =>
  <Call cb={fetchDsds} disabled={dsds !== null}>
    <ArtefactList
      artefacts={dsds}
      onDetailShow={onDetail}
      onCreate={onCreate}
      onDownloadShow={onDownloadShow}
      onCloneShow={onCloneShow}
      onExportShow={onExportShow}
      onDelete={onDsdDelete}
      onSelectedItemDelete={onSelectedDsdDelete}
      onAnnotationsShow={onAnnotationsShow}
      onLayoutAnnotationsShow={onLayoutAnnotationsShow}
      parentsAndChildren={parentsAndChildren}
      fetchParentsAndChildren={triplet => fetchParentsAndChildren("datastructure", triplet)}
      onParentsAndChildrenHide={onParentsAndChildrenHide}
    />
    <CustomAnnotationList
      annotations={dsdAnnotations}
      onClose={onAnnotationsHide}
      title={dsdAnnotationTriplet
        ? getStringFromArtefactTriplet(dsdAnnotationTriplet)
        : null
      }
    />
    <LayoutAnnotationList
      annotations={dsdLayoutAnnotations}
      onClose={onLayoutAnnotationsHide}
      title={dsdAnnotationTriplet
        ? getStringFromArtefactTriplet(dsdAnnotationTriplet)
        : null
      }
    />
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsList);
