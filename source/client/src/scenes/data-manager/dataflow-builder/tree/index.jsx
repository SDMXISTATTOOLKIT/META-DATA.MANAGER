import React from 'react';
import {hideDataflowBuilderTree, readDataflowBuilderTreeCategorisedDataflows} from './actions';
import EnhancedModal from '../../../../components/enhanced-modal';
import Call from '../../../../hocs/call';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {compose} from 'redux';
import EnhancedTree from '../../../../components/enhanced-tree';
import {getLocalizedStr} from '../../../../middlewares/i18n/utils';
import {getDeadEndNodes, getNodes, UNCATEGORIZED_CATEGORY_CODE} from '../../../../utils/tree';
import './style.css';
import {MODAL_WIDTH_LG} from '../../../../styles/constants';
import {getUrnFromArtefact} from "../../../../utils/sdmxJson";
import {Button} from "antd";
import {DataLanguageConsumer} from "../../../../contexts/DataLanguage";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  nodes: state.config.nodes,
  isVisible: state.scenes.dataManager.dataflowBuilder.components.tree.isVisible,
  dataflowTree: state.scenes.dataManager.dataflowBuilder.components.tree.dataflowTree,
});

const mapDispatchToProps = dispatch => ({
  onHide: () => dispatch(hideDataflowBuilderTree()),
  fetchDataflowTree: lang => dispatch(readDataflowBuilderTreeCategorisedDataflows(lang))
});

const DataflowBuilderTree = ({
                               t,
                               appLanguage,
                               dataLanguages,
                               nodes,
                               dataflowTree,
                               isVisible,
                               onHide,
                               fetchDataflowTree
                             }) =>
  <EnhancedModal
    title={t('scenes.dataManager.dataflowBuilder.categorisations.title')}
    visible={isVisible}
    onCancel={onHide}
    width={MODAL_WIDTH_LG}
    footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
    withDataLanguageSelector
  >
    <DataLanguageConsumer>
      {dataLanguage => {
        const lang = dataLanguage || appLanguage;
        return (
          <Call
            cb={fetchDataflowTree}
            cbParam={lang}
            disabled={!(nodes && nodes.length > 0)}
          >
            <div className="dataflow-builder__categorisations__tree">
              <EnhancedTree
                tree={dataflowTree}
                getNodeKey={
                  node =>
                    node.id !== UNCATEGORIZED_CATEGORY_CODE
                      ? getUrnFromArtefact(node)
                      : UNCATEGORIZED_CATEGORY_CODE
                }
                childrenKey="categories"
                idKey="id"
                nameKey="name"
                catIdKey="id"
                catNameKey="name"
                defaultCollapsed
                unselectableKeys={
                  [
                    ...getNodes(dataflowTree, 'categories', () => true)
                      .filter(node => node.id !== UNCATEGORIZED_CATEGORY_CODE)
                      .map(getUrnFromArtefact),
                    UNCATEGORIZED_CATEGORY_CODE
                  ]
                }
                hiddenIdKeys={[UNCATEGORIZED_CATEGORY_CODE]}
                hiddenKeys={getDeadEndNodes(dataflowTree, 'categories').map(getUrnFromArtefact)}
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
                icon="file-text"
                getIconColor={() => "#37a0f4"}
                treeActions={[
                  {
                    title: t('scenes.dataManager.dataflowBuilder.categorisations.refreshButton.title'),
                    icon: 'sync',
                    onClick: fetchDataflowTree
                  }
                ]}
              />
            </div>
          </Call>
        )
      }}
    </DataLanguageConsumer>
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowBuilderTree);
