import {compose} from 'redux';
import React from 'react';
import {translate} from 'react-i18next';
import {
  changeDataflowBuilderWizardCategoryTreeSelection,
  readDataflowBuilderWizardCategoryTreeCategorisations,
} from './actions';
import './style.css';
import Call from '../../../../../hocs/call';
import EnhancedTree from '../../../../../components/enhanced-tree';
import {getLocalizedStr} from '../../../../../middlewares/i18n/utils';
import {connect} from 'react-redux';
import {getUrnFromArtefact} from '../../../../../utils/sdmxJson';
import {getNode, getNodes} from '../../../../../utils/tree';
import {DataLanguageConsumer} from "../../../../../contexts/DataLanguage";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  dataflowTriplet: state.scenes.dataManager.dataflowBuilder.shared.dataflowTriplet,
  categorySchemes: state.scenes.dataManager.dataflowBuilder.components.wizard.components.categoryTree.categorySchemes,
  categoriesUrns: state.scenes.dataManager.dataflowBuilder.shared.categoriesUrns
});

const mapDispatchToProps = dispatch => ({
  onSelectionChange: selection =>
    dispatch(changeDataflowBuilderWizardCategoryTreeSelection(selection)),
  fetchCategorySchemes: lang => dispatch(readDataflowBuilderWizardCategoryTreeCategorisations(lang))
});

const DataflowBuilderWizardCategoryTree = ({
                                             t,
                                             appLanguage,
                                             dataLanguages,
                                             dataflowTriplet,
                                             categorySchemes,
                                             categoriesUrns,
                                             onSelectionChange,
                                             fetchCategorySchemes,
                                             disabled
                                           }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;
      return (
        <Call cb={fetchCategorySchemes} cbParam={lang}>
          <div className="dataflow-builder__wizard__category-tree__tree">
            <EnhancedTree
              tree={categorySchemes}
              getNodeKey={getUrnFromArtefact}
              childrenKey="categories"
              idKey="id"
              nameKey="name"
              catIdKey="id"
              catNameKey="name"
              expandSelectedOnTreeChange
              multiple
              unselectableKeys={
                disabled
                  ? categorySchemes !== null ? getNodes(categorySchemes, "categories", () => true).map(getUrnFromArtefact) : null
                  : categorySchemes !== null ? categorySchemes.map(getUrnFromArtefact) : null
              }
              defaultSelectedKeys={
                categoriesUrns !== null
                  ? categoriesUrns
                  : null
              }
              getFilter={
                searchText =>
                  ({id, name}) => {
                    const search = searchText.toLowerCase();
                    return (id && id.toLowerCase()
                        .indexOf(search) >= 0) ||
                      getLocalizedStr(name, appLanguage, dataLanguages)
                        .toLowerCase()
                        .indexOf(search) >= 0;
                  }
              }
              onSelect={
                selected =>
                  onSelectionChange(
                    selected.map(urn =>
                      getUrnFromArtefact(
                        getNode(categorySchemes, 'categories', node => getUrnFromArtefact(node) === urn)
                      )))
              }
              treeActions={[
                {
                  title: t('scenes.dataManager.dataflowBuilder.wizard.categoryTree.refreshButton.title'),
                  icon: 'sync',
                  onClick: fetchCategorySchemes
                }
              ]}
              icon="file-text"
            />
          </div>
        </Call>
      );
    }}
  </DataLanguageConsumer>;


export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowBuilderWizardCategoryTree);
