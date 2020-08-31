import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import CodelistDetailItem from "./Item";
import ItemsViewer from "../../components/items-viewer";
import ItemsImportForm from "../../components/items-import-form";
import CustomAnnotationList from "../../components/custom-annotation-list";
import {
  changeCodelistDetailItemsImportForm,
  changeCodelistDetailItemsViewMode,
  createCodelistDetailItemsItem,
  cutCodelistDetailItemsItem,
  deleteCodelistDetailsItemsItem,
  dropCodelistDetailItemsItem,
  editCodelistDetailItemsItem,
  hideCodelistDetailItemsFileSystemTree,
  hideCodelistDetailItemsImportForm,
  hideCodelistDetailItemsImportFormAllCsvRows,
  hideCodelistDetailItemsItemAnnotations,
  hideCodelistDetailItemsItemLayoutAnnotations,
  importCodelistDetailItemsImportFormFile,
  pasteCodelistDetailItemsItem,
  readCodelistDetailItemPage,
  readCodelistDetailItemsImportFormAllCsvRows,
  readCodelistDetailItemTree,
  selectCodelistDetailItemsFileSystemTreeItem,
  selectCodelistDetailsItemsItem,
  setCodelistDetailItemsDefaultOrder,
  showCodelistDetailItemsFileSystemTree,
  showCodelistDetailItemsImportForm,
  showCodelistDetailItemsImportFormAllCsvRows,
  showCodelistDetailItemsItemAnnotations,
  showCodelistDetailItemsItemLayoutAnnotations,
  submitCodelistDetailItemsItem,
  updateCodelistDetailItemPageParams,
  uploadCodelistDetailItemsImportFormCsv,
  uploadCodelistDetailItemsImportFormFile
} from "./actions";
import _ from "lodash";
import LayoutAnnotationList from "../../components/layout-annotation-list";
import {setLayoutAnnotationDefaultForCodelist} from "../../utils/annotations";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {reuseAction} from "../../utils/reduxReuse";

const mapStateToProps = (state, {instanceState}) => ({
  appLanguage: state.app.language,
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  codelistTriplet: instanceState.codelistTriplet,
  codelist: instanceState.codelist,
  selectedItem: instanceState.selectedItem,
  itemsViewMode: instanceState.itemsViewMode,
  isItemsImportFormVisible: instanceState.isItemsImportFormVisible,
  itemsImportForm: instanceState.itemsImportForm,
  itemAnnotations: instanceState.itemAnnotations,
  itemLayoutAnnotations: instanceState.itemLayoutAnnotations,
  itemAnnotationId: instanceState.itemAnnotationId,
  itemsTree: instanceState.itemsTree,
  maxOrder: instanceState.maxOrder,
  cutItem: instanceState.cutItem,
  itemPage: instanceState.itemPage,
  fetchPageParams: instanceState.fetchPageParams,
  itemCount: instanceState.itemCount,
  autoSave: instanceState.autoSave,
  isFileSystemTreeVisible: instanceState.isFileSystemTreeVisible,
  fileSystemSelectedItem: instanceState.fileSystemSelectedItem,
  unsavedChange: instanceState.unsavedChange,
  rebuildDb: instanceState.rebuildDb,
  currentTab: instanceState.currentTab
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onCreate: (id, order, lang) => dispatch(reuseAction(createCodelistDetailItemsItem(id, order, lang), instancePrefix)),
  onDetailEdit: item => dispatch(reuseAction(editCodelistDetailItemsItem(item), instancePrefix)),
  onDelete: (codelist, itemId, itemsTree, cutItem, lang, t) =>
    dispatch(reuseAction(deleteCodelistDetailsItemsItem(codelist, itemId, itemsTree, cutItem, lang, t), instancePrefix)),
  onSelect: id => dispatch(reuseAction(selectCodelistDetailsItemsItem(id), instancePrefix)),
  onDrop: (artefactTriplet, itemId, newParentId, moveBefore, moveAfter, lang, autoSave, itemsTree, cutItem, t) =>
    dispatch(reuseAction(dropCodelistDetailItemsItem(artefactTriplet, itemId, newParentId, moveBefore, moveAfter, lang, autoSave, itemsTree, cutItem, t), instancePrefix)),
  onCut: item => dispatch(reuseAction(cutCodelistDetailItemsItem(item), instancePrefix)),
  onPaste: (artefactTriplet, lang, cutItemId, newParentId, pasteAfterId, autoSave) =>
    dispatch(reuseAction(pasteCodelistDetailItemsItem(artefactTriplet, lang, cutItemId, newParentId, pasteAfterId, autoSave), instancePrefix)),
  onAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showCodelistDetailItemsItemAnnotations(annotations, itemId), instancePrefix)),
  onAnnotationsHide: () => dispatch(reuseAction(hideCodelistDetailItemsItemAnnotations(), instancePrefix)),
  onLayoutAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showCodelistDetailItemsItemLayoutAnnotations(annotations, itemId), instancePrefix)),
  onLayoutAnnotationsHide: () => dispatch(reuseAction(hideCodelistDetailItemsItemLayoutAnnotations(), instancePrefix)),
  onImportFormShow: () => dispatch(reuseAction(showCodelistDetailItemsImportForm(), instancePrefix)),
  onImportFormHide: () => dispatch(reuseAction(hideCodelistDetailItemsImportForm(), instancePrefix)),
  onImportFormChange: fields => dispatch(reuseAction(changeCodelistDetailItemsImportForm(fields), instancePrefix)),
  onImportFormFileUpload: (codelist, itemsImportForm) =>
    dispatch(reuseAction(uploadCodelistDetailItemsImportFormFile(codelist, itemsImportForm), instancePrefix)),
  onImportFormFileImport: (codelist, itemsImportForm) =>
    dispatch(reuseAction(importCodelistDetailItemsImportFormFile(codelist, itemsImportForm), instancePrefix)),
  onViewModeChange: viewMode => dispatch(reuseAction(changeCodelistDetailItemsViewMode(viewMode), instancePrefix)),
  fetchItemPage: ({artefactTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc, rebuildDb}) =>
    dispatch(reuseAction(readCodelistDetailItemPage(artefactTriplet, lang, pageNum, pageSize, itemsOrderAnnotationType, searchText, filters, sortCol, sortByDesc, rebuildDb), instancePrefix)),
  fetchPageParamsUpdate: fetchPageParams => dispatch(reuseAction(updateCodelistDetailItemPageParams(fetchPageParams), instancePrefix)),
  fetchItemTree: ({artefactTriplet, lang, itemsOrderAnnotationType, rebuildDb}) =>
    dispatch(reuseAction(readCodelistDetailItemTree(artefactTriplet, lang, itemsOrderAnnotationType, rebuildDb), instancePrefix)),
  onFileSystemtreeShow: () => dispatch(reuseAction(showCodelistDetailItemsFileSystemTree(), instancePrefix)),
  onFileSystemtreeHide: () => dispatch(reuseAction(hideCodelistDetailItemsFileSystemTree(), instancePrefix)),
  onFileSystemSelect: selectedItem => dispatch(reuseAction(selectCodelistDetailItemsFileSystemTreeItem(selectedItem), instancePrefix)),
  onItemSubmit: (triplet, item, lang, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t) =>
    dispatch(reuseAction(submitCodelistDetailItemsItem(triplet, item, lang, isItemEditMode, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t), instancePrefix)),
  onImportFormAllCsvRowsShow: () => dispatch(reuseAction(showCodelistDetailItemsImportFormAllCsvRows(), instancePrefix)),
  onImportFormAllCsvRowsHide: () => dispatch(reuseAction(hideCodelistDetailItemsImportFormAllCsvRows(), instancePrefix)),
  uploadImportFormCsv: file => dispatch(reuseAction(uploadCodelistDetailItemsImportFormCsv(file), instancePrefix)),
  fetchImportFormAllCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(reuseAction(readCodelistDetailItemsImportFormAllCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath), instancePrefix)),
  onSetDefaultOrder: (artefactTriplet, lang) => dispatch(reuseAction(setCodelistDetailItemsDefaultOrder(artefactTriplet, lang), instancePrefix))
});

const CodelistDetailItems = ({
                               t,
                               appLanguage,
                               nodes,
                               nodeId,
                               instanceState,
                               instancePrefix,
                               codelistTriplet,
                               codelist,
                               itemCount,
                               itemPage,
                               itemsTree,
                               selectedItem,
                               cutItem,
                               itemAnnotations,
                               itemLayoutAnnotations,
                               itemAnnotationId,
                               itemsViewMode,
                               isItemsImportFormVisible,
                               itemsImportForm,
                               onCreate,
                               onDetailEdit,
                               onDelete,
                               onSelect,
                               onDrop,
                               onCut,
                               onPaste,
                               onAnnotationsShow,
                               onAnnotationsHide,
                               onLayoutAnnotationsShow,
                               onLayoutAnnotationsHide,
                               onImportFormShow,
                               onImportFormHide,
                               onImportFormChange,
                               onImportFormFileUpload,
                               onImportFormFileImport,
                               onViewModeChange,
                               fetchItemTree,
                               fetchItemPage,
                               fetchPageParams,
                               fetchPageParamsUpdate,
                               autoSave,
                               isFileSystemTreeVisible,
                               onFileSystemtreeShow,
                               onFileSystemtreeHide,
                               fileSystemSelectedItem,
                               onFileSystemSelect,
                               unsavedChange,
                               rebuildDb,
                               onItemSubmit,
                               onImportFormAllCsvRowsShow,
                               onImportFormAllCsvRowsHide,
                               uploadImportFormCsv,
                               fetchImportFormAllCsvRows,
                               isEditDisabled,
                               currentTab,
                               onSetDefaultOrder
                             }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;

      const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
      const itemsOrderAnnotationType =
        _.find(nodes, node => node.general.id === nodeId).annotations.codelistsOrder;

      return (
        <Fragment>
          <ItemsViewer
            artefact={codelist}
            artefactTriplet={codelistTriplet}
            itemTree={itemsTree}
            fetchTree={fetchItemTree}
            itemPage={itemPage}
            fetchPageParams={fetchPageParams}
            fetchPageParamsUpdate={fetchPageParamsUpdate}
            fetchPage={fetchItemPage}
            itemCount={itemCount}
            childrenKey={"codes"}
            selectedItem={selectedItem}
            cutItem={cutItem}
            itemsViewMode={itemsViewMode}
            itemsOrderAnnotationType={itemsOrderAnnotationType}
            onPaginatedCreate={onCreate}
            onPaginatedDelete={onDelete}
            onDetailShow={onDetailEdit}
            onSelect={onSelect}
            onPaginatedDrop={onDrop}
            onCut={onCut}
            onPaginatedPaste={onPaste}
            onAnnotationsShow={onAnnotationsShow}
            onLayoutAnnotationsShow={onLayoutAnnotationsShow}
            onViewModeChange={onViewModeChange}
            onImportFormShow={onImportFormShow}
            autoSave={autoSave}
            isFileSystemTreeVisible={isFileSystemTreeVisible}
            onFileSystemtreeShow={onFileSystemtreeShow}
            onFileSystemtreeHide={onFileSystemtreeHide}
            fileSystemSelectedItem={fileSystemSelectedItem}
            onFileSystemSelect={onFileSystemSelect}
            unsavedChange={unsavedChange}
            rebuildDb={rebuildDb}
            onSetDefault={item => {
              const newItem = _.cloneDeep(item);
              newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, true);
              onItemSubmit(codelistTriplet, newItem, lang, true, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t)
            }}
            onUnsetDefault={item => {
              const newItem = _.cloneDeep(item);
              newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, false);
              onItemSubmit(codelistTriplet, newItem, lang, true, autoSave, itemsOrderAnnotationType, itemsTree, cutItem, t)
            }}
            isEditDisabled={isEditDisabled}
            isCallDisabled={currentTab !== "items"}
            onPaginatedSetDefaultOrder={onSetDefaultOrder}
          />
          <ItemsImportForm
            isVisible={isItemsImportFormVisible}
            formData={itemsImportForm}
            onHide={onImportFormHide}
            onChange={onImportFormChange}
            onUpload={() => onImportFormFileUpload(codelist, itemsImportForm)}
            onImport={() => onImportFormFileImport(codelist, itemsImportForm)}
            onAllCsvRowsShow={onImportFormAllCsvRowsShow}
            onAllCsvRowsHide={onImportFormAllCsvRowsHide}
            uploadCsv={uploadImportFormCsv}
            fetchAllCsvRows={fetchImportFormAllCsvRows}
          />
          <CodelistDetailItem
            instanceState={instanceState}
            instancePrefix={instancePrefix}
            isEditDisabled={isEditDisabled}
          />
          <CustomAnnotationList
            annotations={itemAnnotations}
            onClose={onAnnotationsHide}
            title={itemAnnotationId}
          />
          <LayoutAnnotationList
            annotations={itemLayoutAnnotations}
            onClose={onLayoutAnnotationsHide}
            title={itemAnnotationId}
          />
        </Fragment>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CodelistDetailItems);
