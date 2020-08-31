import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Modal} from "antd";
import React, {Fragment} from "react";
import {
  changeConceptSchemeDetailItemsImportForm,
  changeConceptSchemeDetailItemsViewMode,
  createConceptSchemeDetailsItemsItem,
  cutConceptSchemeDetailItemsItem,
  deleteConceptSchemeDetailsItemsItem,
  dropConceptSchemeDetailItemsItems,
  editConceptSchemeDetailItemsItemDetail,
  hideConceptSchemeDetailItemsImportForm,
  hideConceptSchemeDetailItemsImportFormAllCsvRows,
  hideConceptSchemeDetailItemsItemAnnotations,
  hideConceptSchemeDetailItemsItemDuplicateItemError,
  hideConceptSchemeDetailItemsItemLayoutAnnotations,
  importConceptSchemeDetailItemsImportFormFile,
  pasteConceptSchemeDetailItemsItem,
  readConceptSchemeDetailItemsImportFormAllCsvRows,
  selectConceptSchemeDetailsItemsItem,
  setConceptSchemeDetailItemsDefaultOrder,
  showConceptSchemeDetailItemsImportForm,
  showConceptSchemeDetailItemsImportFormAllCsvRows,
  showConceptSchemeDetailItemsItemAnnotations,
  showConceptSchemeDetailItemsItemLayoutAnnotations,
  submitConceptSchemeDetailItemsItem,
  uploadConceptSchemeDetailItemsImportFormCsv,
  uploadConceptSchemeDetailItemsImportFormFile
} from "./actions";
import ConceptSchemesDetailItem from "./Item";
import ItemsImportForm from "../../components/items-import-form";
import _ from "lodash";
import CustomAnnotationList from "../../components/custom-annotation-list";
import Call from "../../hocs/call";
import ItemsViewer from "../../components/items-viewer";
import LayoutAnnotationList from "../../components/layout-annotation-list";
import {setLayoutAnnotationDefaultForCodelist} from "../../utils/annotations";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {reuseAction} from "../../utils/reduxReuse";

const mapStateToProps = (state, {instanceState}) => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  appLanguage: state.app.language,
  conceptSchemeTriplet: instanceState.conceptSchemeTriplet,
  conceptScheme: instanceState.conceptScheme,
  selectedItem: instanceState.selectedItem,
  itemsViewMode: instanceState.itemsViewMode,
  isItemsImportFormVisible: instanceState.isItemsImportFormVisible,
  itemsImportForm: instanceState.itemsImportForm,
  itemAnnotations: instanceState.itemAnnotations,
  itemLayoutAnnotations: instanceState.itemLayoutAnnotations,
  itemAnnotationId: instanceState.itemAnnotationId,
  itemsTree: instanceState.itemsTree,
  maxOrder: instanceState.maxOrder,
  isDuplicateItemErrorVisible: instanceState.isDuplicateItemErrorVisible,
  cutItem: instanceState.cutItem
});

const mapDispatchToProps = (dispatch, {instancePrefix}) => ({
  onViewModeChange: viewMode => dispatch(reuseAction(changeConceptSchemeDetailItemsViewMode(viewMode), instancePrefix)),
  onCreate: (parentId, order, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(createConceptSchemeDetailsItemsItem(parentId, order, lang, itemsOrderAnnotationType), instancePrefix)),
  onDetailEdit: item => dispatch(reuseAction(editConceptSchemeDetailItemsItemDetail(item), instancePrefix)),
  onDelete: (conceptScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) =>
    dispatch(reuseAction(deleteConceptSchemeDetailsItemsItem(conceptScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType), instancePrefix)),
  onSelect: id => dispatch(reuseAction(selectConceptSchemeDetailsItemsItem(id), instancePrefix)),
  onImportFormShow: () => dispatch(reuseAction(showConceptSchemeDetailItemsImportForm(), instancePrefix)),
  onImportFormHide: () => dispatch(reuseAction(hideConceptSchemeDetailItemsImportForm(), instancePrefix)),
  onImportFormChange: fields => dispatch(reuseAction(changeConceptSchemeDetailItemsImportForm(fields), instancePrefix)),
  onImportFormFileUpload: (conceptScheme, itemsImportForm) =>
    dispatch(reuseAction(uploadConceptSchemeDetailItemsImportFormFile(conceptScheme, itemsImportForm), instancePrefix)),
  onImportFormFileImport: (conceptScheme, itemsImportForm) =>
    dispatch(reuseAction(importConceptSchemeDetailItemsImportFormFile(conceptScheme, itemsImportForm), instancePrefix)),
  onAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showConceptSchemeDetailItemsItemAnnotations(annotations, itemId), instancePrefix)),
  onAnnotationsHide: () => dispatch(reuseAction(hideConceptSchemeDetailItemsItemAnnotations(), instancePrefix)),
  onLayoutAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showConceptSchemeDetailItemsItemLayoutAnnotations(annotations, itemId), instancePrefix)),
  onLayoutAnnotationsHide: () => dispatch(reuseAction(hideConceptSchemeDetailItemsItemLayoutAnnotations(), instancePrefix)),
  onDrop: (node, newParent, newOrder, conceptScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) =>
    dispatch(reuseAction(dropConceptSchemeDetailItemsItems(
      node, newParent, newOrder, conceptScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t
    ), instancePrefix)),
  onDuplicateItemErrorHide: () => dispatch(reuseAction(hideConceptSchemeDetailItemsItemDuplicateItemError(), instancePrefix)),
  onCut: item => dispatch(reuseAction(cutConceptSchemeDetailItemsItem(item), instancePrefix)),
  onPaste: (cutItem, newParent, pasteAfter, conceptScheme, itemsTree, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(pasteConceptSchemeDetailItemsItem(cutItem, newParent, pasteAfter, conceptScheme, itemsTree, lang, itemsOrderAnnotationType), instancePrefix)),
  onItemSubmit: (conceptScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) =>
    dispatch(reuseAction(submitConceptSchemeDetailItemsItem(
      conceptScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
    ), instancePrefix)),
  onImportFormAllCsvRowsShow: () => dispatch(reuseAction(showConceptSchemeDetailItemsImportFormAllCsvRows(), instancePrefix)),
  onImportFormAllCsvRowsHide: () => dispatch(reuseAction(hideConceptSchemeDetailItemsImportFormAllCsvRows(), instancePrefix)),
  uploadImportFormCsv: file => dispatch(reuseAction(uploadConceptSchemeDetailItemsImportFormCsv(file), instancePrefix)),
  fetchImportFormAllCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(reuseAction(readConceptSchemeDetailItemsImportFormAllCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath), instancePrefix)),
  onSetDefaultOrder: (conceptScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType) =>
    dispatch(reuseAction(setConceptSchemeDetailItemsDefaultOrder(conceptScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType), instancePrefix))
});

const ConceptSchemeDetailItems = ({
                                    t,
                                    nodes,
                                    nodeId,
                                    appLanguage,
                                    instanceState,
                                    instancePrefix,
                                    isEditDisabled,
                                    conceptSchemeTriplet,
                                    conceptScheme,
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
                                    itemAnnotations,
                                    itemLayoutAnnotations,
                                    itemAnnotationId,
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
                                    onSetDefaultOrder
                                  }) => {

  const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
  const itemsOrderAnnotationType =
    _.find(nodes, node => node.general.id === nodeId).annotations.conceptSchemesOrder;

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <ItemsViewer
              artefact={conceptScheme}
              artefactTriplet={conceptSchemeTriplet}
              itemTree={itemsTree}
              childrenKey={"concepts"}
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
                onItemSubmit(conceptScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              onUnsetDefault={item => {
                const newItem = _.cloneDeep(item);
                newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, false);
                onItemSubmit(conceptScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              isEditDisabled={isEditDisabled}
              onSetDefaultOrder={onSetDefaultOrder}
            />
            <ItemsImportForm
              isVisible={isItemsImportFormVisible}
              formData={itemsImportForm}
              onHide={onImportFormHide}
              onChange={onImportFormChange}
              onUpload={() => onImportFormFileUpload(conceptScheme, itemsImportForm)}
              onImport={() => onImportFormFileImport(conceptScheme, itemsImportForm)}
              onAllCsvRowsShow={onImportFormAllCsvRowsShow}
              onAllCsvRowsHide={onImportFormAllCsvRowsHide}
              uploadCsv={uploadImportFormCsv}
              fetchAllCsvRows={fetchImportFormAllCsvRows}
            />
            <ConceptSchemesDetailItem
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
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ConceptSchemeDetailItems);
