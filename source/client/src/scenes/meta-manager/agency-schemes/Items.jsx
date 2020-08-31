import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Modal} from "antd";
import React, {Fragment} from "react";
import {
  addAgencyToConfig,
  changeAgencySchemesDetailItemsImportForm,
  changeAgencySchemesDetailItemsViewMode,
  createAgencySchemesDetailsItemsItem,
  cutAgencySchemesDetailItemsItem,
  deleteAgencySchemesDetailsItemsItem,
  dropAgencySchemesDetailItemsItems,
  editAgencySchemesDetailItemsItemDetail,
  hideAgencySchemeDetailItemsItemDuplicateItemError,
  hideAgencySchemesDetailItemsImportForm,
  hideAgencySchemesDetailItemsImportFormAllCsvRows,
  hideAgencySchemesDetailItemsItemAnnotations,
  hideAgencySchemesDetailItemsItemLayoutAnnotations,
  importAgencySchemesDetailItemsImportFormFile,
  pasteAgencySchemesDetailItemsItem,
  readAgencySchemesDetailItemsImportFormAllCsvRows,
  selectAgencySchemesDetailsItemsItem,
  showAgencySchemesDetailItemsImportForm,
  showAgencySchemesDetailItemsImportFormAllCsvRows,
  showAgencySchemesDetailItemsItemAnnotations,
  showAgencySchemesDetailItemsItemLayoutAnnotations,
  submitAgencySchemesDetailItemsItem,
  uploadAgencySchemesDetailItemsImportFormCsv,
  uploadAgencySchemesDetailItemsImportFormFile
} from "./actions";
import Item from "./Item";
import ItemsImportForm from "../../../components/items-import-form";
import _ from "lodash";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import LayoutAnnotationList from "../../../components/layout-annotation-list";
import Call from "../../../hocs/call";
import ItemsViewer from "../../../components/items-viewer";
import {setLayoutAnnotationDefaultForCodelist} from "../../../utils/annotations";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";

const mapDispatchToProps = dispatch => ({
  onViewModeChange: viewMode => dispatch(changeAgencySchemesDetailItemsViewMode(viewMode)),
  onCreate: (parentId, order, lang, itemsOrderAnnotationType) =>
    dispatch(createAgencySchemesDetailsItemsItem(parentId, order, lang, itemsOrderAnnotationType)),
  onDetailEdit: item => dispatch(editAgencySchemesDetailItemsItemDetail(item)),
  onDelete: (agencyScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) =>
    dispatch(deleteAgencySchemesDetailsItemsItem(agencyScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType)),
  onSelect: id => dispatch(selectAgencySchemesDetailsItemsItem(id)),
  onImportFormShow: () => dispatch(showAgencySchemesDetailItemsImportForm()),
  onImportFormHide: () => dispatch(hideAgencySchemesDetailItemsImportForm()),
  onImportFormChange: fields => dispatch(changeAgencySchemesDetailItemsImportForm(fields)),
  onImportFormFileUpload: (agencyScheme, itemsImportForm) =>
    dispatch(uploadAgencySchemesDetailItemsImportFormFile(agencyScheme, itemsImportForm)),
  onImportFormFileImport: (agencyScheme, itemsImportForm) =>
    dispatch(importAgencySchemesDetailItemsImportFormFile(agencyScheme, itemsImportForm)),
  onAnnotationsShow: annotations => dispatch(showAgencySchemesDetailItemsItemAnnotations(annotations)),
  onAnnotationsHide: () => dispatch(hideAgencySchemesDetailItemsItemAnnotations()),
  onLayoutAnnotationsShow: annotations => dispatch(showAgencySchemesDetailItemsItemLayoutAnnotations(annotations)),
  onLayoutAnnotationsHide: () => dispatch(hideAgencySchemesDetailItemsItemLayoutAnnotations()),
  onDrop: (node, newParent, newOrder, agencyScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) =>
    dispatch(dropAgencySchemesDetailItemsItems(
      node, newParent, newOrder, agencyScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t
    )),
  onDuplicateItemErrorHide: () => dispatch(hideAgencySchemeDetailItemsItemDuplicateItemError()),
  onCut: item => dispatch(cutAgencySchemesDetailItemsItem(item)),
  onPaste: (cutItem, newParent, pasteAfter, agencyScheme, itemsTree, lang, itemsOrderAnnotationType) =>
    dispatch(pasteAgencySchemesDetailItemsItem(cutItem, newParent, pasteAfter, agencyScheme, itemsTree, lang, itemsOrderAnnotationType)),
  onItemSubmit: (agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) =>
    dispatch(submitAgencySchemesDetailItemsItem(agencyScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t)),
  onImportFormAllCsvRowsShow: () => dispatch(showAgencySchemesDetailItemsImportFormAllCsvRows()),
  onImportFormAllCsvRowsHide: () => dispatch(hideAgencySchemesDetailItemsImportFormAllCsvRows()),
  uploadImportFormCsv: file => dispatch(uploadAgencySchemesDetailItemsImportFormCsv(file)),
  fetchImportFormAllCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(readAgencySchemesDetailItemsImportFormAllCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath)),
  onAddAgencyToConfig: (superUserUsername, endpointId, agency) => dispatch(addAgencyToConfig(superUserUsername, endpointId, agency))
});

const mapStateToProps = state => ({
  agencySchemeTriplet: state.scenes.metaManager.agencySchemes.agencySchemeTriplet,
  agencyScheme: state.scenes.metaManager.agencySchemes.agencyScheme,
  selectedItem: state.scenes.metaManager.agencySchemes.selectedItem,
  itemsViewMode: state.scenes.metaManager.agencySchemes.itemsViewMode,
  isItemsImportFormVisible: state.scenes.metaManager.agencySchemes.isItemsImportFormVisible,
  itemsImportForm: state.scenes.metaManager.agencySchemes.itemsImportForm,
  nodes: state.config.nodes,
  endpointId: state.app.endpointId,
  permissions: state.app.user.permissions,
  itemAnnotations: state.scenes.metaManager.agencySchemes.itemAnnotations,
  itemLayoutAnnotations: state.scenes.metaManager.agencySchemes.itemLayoutAnnotations,
  itemsTree: state.scenes.metaManager.agencySchemes.itemsTree,
  maxOrder: state.scenes.metaManager.agencySchemes.maxOrder,
  isDuplicateItemErrorVisible: state.scenes.metaManager.agencySchemes.isDuplicateItemErrorVisible,
  cutItem: state.scenes.metaManager.agencySchemes.cutItem,
  appLanguage: state.app.language,
  superUserUsername: state.app.superUser.username
});

const AgencySchemesDetailItems = ({
                                    t,
                                    appLanguage,
                                    agencySchemeTriplet,
                                    agencyScheme,
                                    itemsViewMode,
                                    selectedItem,
                                    isItemsImportFormVisible,
                                    itemsImportForm,
                                    onViewModeChange,
                                    onCreate,
                                    onDetailEdit,
                                    onDelete,
                                    onSelect,
                                    onImportFormShow,
                                    onImportFormHide,
                                    onImportFormChange,
                                    onImportFormFileUpload,
                                    onImportFormFileImport,
                                    nodes,
                                    endpointId,
                                    itemAnnotations,
                                    itemLayoutAnnotations,
                                    onAnnotationsShow,
                                    onAnnotationsHide,
                                    onLayoutAnnotationsShow,
                                    onLayoutAnnotationsHide,
                                    onDrop,
                                    itemsTree,
                                    maxOrder,
                                    isDuplicateItemErrorVisible,
                                    onDuplicateItemErrorHide,
                                    cutItem,
                                    onCut,
                                    onPaste,
                                    onItemSubmit,
                                    onImportFormAllCsvRowsShow,
                                    onImportFormAllCsvRowsHide,
                                    uploadImportFormCsv,
                                    fetchImportFormAllCsvRows,
                                    onAddAgencyToConfig,
                                    superUserUsername
                                  }) => {

  const annotationsConfig = nodes.find(node => node.general.id === endpointId).annotations;
  const itemsOrderAnnotationType =
    _.find(nodes, node => node.general.id === endpointId).annotations.codelistsOrder;

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <ItemsViewer
              artefact={agencyScheme}
              artefactTriplet={agencySchemeTriplet}
              itemTree={itemsTree}
              childrenKey={"agencies"}
              selectedItem={selectedItem}
              cutItem={cutItem}
              itemsViewMode={itemsViewMode}
              itemsOrderAnnotationType={itemsOrderAnnotationType}
              maxOrder={maxOrder}
              onCreate={onCreate}
              onDelete={onDelete}
              onDetailShow={onDetailEdit}
              onSelect={onSelect}
              onDrop={onDrop}
              onCut={onCut}
              onPaste={onPaste}
              onAnnotationsShow={onAnnotationsShow}
              onLayoutAnnotationsShow={onLayoutAnnotationsShow}
              onViewModeChange={onViewModeChange}
              onImportFormShow={onImportFormShow}
              onSetDefault={item => {
                const newItem = _.cloneDeep(item);
                newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, true);
                onItemSubmit(agencyScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              onUnsetDefault={item => {
                const newItem = _.cloneDeep(item);
                newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, false);
                onItemSubmit(agencyScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              isNotHierarchical
              onAddAgencyToConfig={agency => onAddAgencyToConfig(superUserUsername, endpointId, agency)}
            />
            <ItemsImportForm
              isVisible={isItemsImportFormVisible}
              formData={itemsImportForm}
              onHide={onImportFormHide}
              onChange={onImportFormChange}
              onUpload={() => onImportFormFileUpload(agencyScheme, itemsImportForm)}
              onImport={() => onImportFormFileImport(agencyScheme, itemsImportForm)}
              onAllCsvRowsShow={onImportFormAllCsvRowsShow}
              onAllCsvRowsHide={onImportFormAllCsvRowsHide}
              uploadCsv={uploadImportFormCsv}
              fetchAllCsvRows={fetchImportFormAllCsvRows}
            />
            <Item/>
            <CustomAnnotationList
              annotations={itemAnnotations}
              onClose={onAnnotationsHide}
            />
            <LayoutAnnotationList
              annotations={itemLayoutAnnotations}
              onClose={onLayoutAnnotationsHide}
            />
            {
              isDuplicateItemErrorVisible && (
                <Call
                  cb={() => Modal.error({
                    title: t('commons.artefact.tabs.items.modals.errors.duplicateItem'),
                    onOk() {
                      onDuplicateItemErrorHide()
                    },
                    onCancel() {
                      onDuplicateItemErrorHide()
                    }
                  })}
                >
                  <span/>
                </Call>
              )
            }
          </Fragment>
        );
      }}
    </DataLanguageConsumer>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(AgencySchemesDetailItems);
