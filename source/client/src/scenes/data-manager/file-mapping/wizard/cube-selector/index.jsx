import Call from '../../../../../hocs/call';
import EnhancedTree from '../../../../../components/enhanced-tree';
import {DCS_ORDERED_TREE_ROOT} from '../../../../../utils/treeBuilders';
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from '../../../../../utils/tree';
import {getLocalizedStr} from '../../../../../middlewares/i18n/utils';
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {
  readFileMappingWizardCubeSelectorCategorisedCubes,
  setFileMappingWizardCubeSelectorCube,
  unsetFileMappingWizardCubeSelectorCube
} from './actions';
import {translate} from 'react-i18next';

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  categorisedCubes: state.scenes.dataManager.fileMapping.components.wizard.components.cubeSelector.categorisedCubes,
});

const mapDispatchToProps = dispatch => ({
  onCubeSet: (cubeId, cubeCode) => dispatch(setFileMappingWizardCubeSelectorCube(cubeId, cubeCode)),
  onCubeUnset: () => dispatch(unsetFileMappingWizardCubeSelectorCube()),
  fetchCategorisedCubes: () => dispatch(readFileMappingWizardCubeSelectorCategorisedCubes())
});

const FileMappingWizardCubeSelector = ({
                                         t,
                                         appLanguage,
                                         dataLanguages,
                                         categorisedCubes,
                                         onCubeSet,
                                         onCubeUnset,
                                         fetchCategorisedCubes
                                       }) =>
  <Call cb={fetchCategorisedCubes} disabled={categorisedCubes !== null}>
    <EnhancedTree
      tree={categorisedCubes}
      idKey="Code"
      childrenKey="children"
      nameKey="labels"
      catIdKey="CatCode"
      catNameKey="labels"
      unselectableKeys={getNodes(categorisedCubes, 'children', node => node.children)
        .map(node => node.CatCode)}
      hiddenIdKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
      getFilter={
        searchText =>
          ({ Code, CatCode, labels }) => {
            const search = searchText.toLowerCase();
            return (Code && Code.toLowerCase()
                .indexOf(search) >= 0) ||
              (CatCode && CatCode.toLowerCase()
                .indexOf(search) >= 0) ||
              getLocalizedStr(labels, appLanguage, dataLanguages)
                .toLowerCase()
                .indexOf(search) >= 0;
          }
      }
      onSelect={
        selectedArr => {
          const node = getNode(
            categorisedCubes,
            'children',
            node => node.children
              ? node.CatCode === selectedArr[0]
              : node.Code === selectedArr[0]
          );
          if (node !== null && node.children === undefined) {
            onCubeSet(node.IDCube, node.Code);
          } else {
            onCubeUnset();
          }
        }
      }
      treeActions={[
        {
          title: t('scenes.dataManager.fileMapping.wizard.cubeSelector.refreshButton.title'),
          icon: 'sync',
          onClick: fetchCategorisedCubes
        }
      ]}
      icon="cube"
      isCustomIcon
      getIconColor={() => "#37a0f4"}
    />
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(FileMappingWizardCubeSelector);
