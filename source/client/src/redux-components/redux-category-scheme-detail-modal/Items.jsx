import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {Modal} from "antd";
import React, {Fragment} from "react";
import {
  changeCategorySchemeDetailItemsImportForm,
  changeCategorySchemeDetailItemsViewMode,
  createCategorySchemesDetailsItemsItem,
  cutCategorySchemeDetailItemsItem,
  deleteCategorySchemeDetailsItemsItem,
  dropCategorySchemesDetailItemsItems,
  editCategorySchemesDetailItemsItem,
  hideCategorySchemeDetailItemsImportForm,
  hideCategorySchemeDetailItemsImportFormAllCsvRows,
  hideCategorySchemeDetailItemsItemAnnotations,
  hideCategorySchemeDetailItemsItemDuplicateItemError,
  hideCategorySchemeDetailItemsItemLayoutAnnotations,
  importCategorySchemeDetailItemsImportFormFile,
  pasteCategorySchemeDetailItemsItem,
  readCategorySchemeDetailItemsImportFormAllCsvRows,
  selectCategorySchemeDetailsItemsItem,
  setCategorySchemeDetailItemsDefaultOrder,
  showCategorySchemeDetailItemsImportForm,
  showCategorySchemeDetailItemsImportFormAllCsvRows,
  showCategorySchemeDetailItemsItemAnnotations,
  showCategorySchemeDetailItemsItemLayoutAnnotations,
  submitCategorySchemeDetailItemsItem,
  uploadCategorySchemeDetailItemsImportFormCsv,
  uploadCategorySchemeDetailItemsImportFormFile
} from "./actions";
import CategorySchemeDetailItem from "./Item";
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
  categorySchemeTriplet: instanceState.categorySchemeTriplet,
  categoryScheme: instanceState.categoryScheme,
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
  onViewModeChange: viewMode => dispatch(reuseAction(changeCategorySchemeDetailItemsViewMode(viewMode), instancePrefix)),
  onCreate: (parentId, order, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(createCategorySchemesDetailsItemsItem(parentId, order, lang, itemsOrderAnnotationType), instancePrefix)),
  onDetailEdit: item => dispatch(reuseAction(editCategorySchemesDetailItemsItem(item), instancePrefix)),
  onDelete: (categoryScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType) =>
    dispatch(reuseAction(deleteCategorySchemeDetailsItemsItem(categoryScheme, itemsTree, item, cutItem, lang, t, itemsOrderAnnotationType), instancePrefix)),
  onSelect: id => dispatch(reuseAction(selectCategorySchemeDetailsItemsItem(id), instancePrefix)),
  onImportFormShow: () => dispatch(reuseAction(showCategorySchemeDetailItemsImportForm(), instancePrefix)),
  onImportFormHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsImportForm(), instancePrefix)),
  onImportFormChange: fields => dispatch(reuseAction(changeCategorySchemeDetailItemsImportForm(fields), instancePrefix)),
  onImportFormFileUpload: (categoryScheme, itemsImportForm) =>
    dispatch(reuseAction(uploadCategorySchemeDetailItemsImportFormFile(categoryScheme, itemsImportForm), instancePrefix)),
  onImportFormFileImport: (categoryScheme, itemsImportForm) =>
    dispatch(reuseAction(importCategorySchemeDetailItemsImportFormFile(categoryScheme, itemsImportForm), instancePrefix)),
  onAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showCategorySchemeDetailItemsItemAnnotations(annotations, itemId), instancePrefix)),
  onAnnotationsHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsItemAnnotations(), instancePrefix)),
  onLayoutAnnotationsShow: (annotations, itemId) =>
    dispatch(reuseAction(showCategorySchemeDetailItemsItemLayoutAnnotations(annotations, itemId), instancePrefix)),
  onLayoutAnnotationsHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsItemLayoutAnnotations(), instancePrefix)),
  onDrop: (node, newParent, newOrder, categoryScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t) =>
    dispatch(reuseAction(dropCategorySchemesDetailItemsItems(
      node, newParent, newOrder, categoryScheme, itemsTree, itemsOrderAnnotationType, lang, cutItem, t
    ), instancePrefix)),
  onDuplicateItemErrorHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsItemDuplicateItemError(), instancePrefix)),
  onCut: item => dispatch(reuseAction(cutCategorySchemeDetailItemsItem(item), instancePrefix)),
  onPaste: (cutItem, newParent, pasteAfter, categoryScheme, itemsTree, lang, itemsOrderAnnotationType) =>
    dispatch(reuseAction(pasteCategorySchemeDetailItemsItem(cutItem, newParent, pasteAfter, categoryScheme, itemsTree, lang, itemsOrderAnnotationType), instancePrefix)),
  onItemSubmit: (categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t) =>
    dispatch(reuseAction(submitCategorySchemeDetailItemsItem(
      categoryScheme, itemsTree, item, itemsOrderAnnotationType, isItemEditMode, lang, isNormalizeNeeded, cutItem, t
    ), instancePrefix)),
  onImportFormAllCsvRowsShow: () => dispatch(reuseAction(showCategorySchemeDetailItemsImportFormAllCsvRows(), instancePrefix)),
  onImportFormAllCsvRowsHide: () => dispatch(reuseAction(hideCategorySchemeDetailItemsImportFormAllCsvRows(), instancePrefix)),
  uploadImportFormCsv: file => dispatch(reuseAction(uploadCategorySchemeDetailItemsImportFormCsv(file), instancePrefix)),
  fetchImportFormAllCsvRows: (pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath) =>
    dispatch(reuseAction(readCategorySchemeDetailItemsImportFormAllCsvRows(pageNum, pageSize, filterTable, sortCols, sortByDesc, separator, delimiter, hasHeader, filePath), instancePrefix)),
  onSetDefaultOrder: (categoryScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType) =>
    dispatch(reuseAction(setCategorySchemeDetailItemsDefaultOrder(categoryScheme, itemsTree, currLang, dataLangs, itemsOrderAnnotationType), instancePrefix))
});

const CategorySchemeDetailItems = ({
                                     t,
                                     nodes,
                                     nodeId,
                                     appLanguage,
                                     instanceState,
                                     instancePrefix,
                                     isEditDisabled,
                                     categorySchemeTriplet,
                                     categoryScheme,
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
    _.find(nodes, node => node.general.id === nodeId).annotations.categorySchemesOrder;

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Fragment>
            <ItemsViewer
              artefact={categoryScheme}
              artefactTriplet={categorySchemeTriplet}
              itemTree={itemsTree}
              childrenKey={"categories"}
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
                onItemSubmit(categoryScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              onUnsetDefault={item => {
                const newItem = _.cloneDeep(item);
                newItem.annotations = setLayoutAnnotationDefaultForCodelist(newItem.annotations, annotationsConfig, false);
                onItemSubmit(categoryScheme, itemsTree, newItem, itemsOrderAnnotationType, true, lang, false, cutItem, t)
              }}
              isEditDisabled={isEditDisabled}
              onSetDefaultOrder={onSetDefaultOrder}
            />
            <ItemsImportForm
              isVisible={isItemsImportFormVisible}
              formData={itemsImportForm}
              onHide={onImportFormHide}
              onChange={onImportFormChange}
              onUpload={() => onImportFormFileUpload(categoryScheme, itemsImportForm)}
              onImport={() => onImportFormFileImport(categoryScheme, itemsImportForm)}
              onAllCsvRowsShow={onImportFormAllCsvRowsShow}
              onAllCsvRowsHide={onImportFormAllCsvRowsHide}
              uploadCsv={uploadImportFormCsv}
              fetchAllCsvRows={fetchImportFormAllCsvRows}
            />
            <CategorySchemeDetailItem
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
)(CategorySchemeDetailItems);
