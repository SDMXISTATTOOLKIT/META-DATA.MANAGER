import {Modal} from 'antd';
import Call from '../../../../hocs/call';
import React from 'react';
import EnhancedTree from '../../../../components/enhanced-tree';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import {
  createBuilderCubeTreeCube,
  deleteBuilderCubeTreeCube,
  readBuilderCubeTreeCategorisedCubes,
  selectBuilderCubeTreeCube,
  selectBuilderCubeTreeCubeCategory,
  updateBuilderCubeTreeCategorisedCubes
} from './actions';
import {getLocalizedStr} from '../../../../middlewares/i18n/utils';
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from '../../../../utils/tree';
import {DCS_ORDERED_TREE_ROOT} from '../../../../utils/treeBuilders';
import {SPAN_HALF} from "../../../../styles/constants";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  categorisedCubes: state.scenes.dataManager.builder.components.cubeTree.categorisedCubes,
  selectedCubeId: state.scenes.dataManager.builder.shared.cubeId,
  selectedCategoryId: state.scenes.dataManager.builder.shared.cubeCategoryId,
  selectedCategoryCode: state.scenes.dataManager.builder.shared.cubeCategoryCode,
  permissions: state.app.user.permissions,
});

const mapDispatchToProps = dispatch => ({
  onCubeSelect: cubeId => dispatch(selectBuilderCubeTreeCube(cubeId)),
  onCategorySelect: (categoryId, categoryCode) => dispatch(selectBuilderCubeTreeCubeCategory(categoryId, categoryCode)),
  onCubeCreate: categoryId => dispatch(createBuilderCubeTreeCube(categoryId)),
  onCubeDelete: cubeId => dispatch(deleteBuilderCubeTreeCube(cubeId)),
  onUpdateCategorisedCubes: () => dispatch(updateBuilderCubeTreeCategorisedCubes()),
  fetchCategorisedCubes: () => dispatch(readBuilderCubeTreeCategorisedCubes())
});

const BuilderCategorisedCubesTree = ({
                                       t,
                                       appLanguage,
                                       permissions,
                                       dataLanguages,
                                       categorisedCubes,
                                       selectedCubeId,
                                       selectedCategoryId,
                                       selectedCategoryCode,
                                       onCubeSelect,
                                       onCategorySelect,
                                       onCubeCreate,
                                       onCubeDelete,
                                       onUpdateCategorisedCubes,
                                       fetchCategorisedCubes
                                     }) => {
  const forbiddenCubesCodes =
    getNodes(
      categorisedCubes,
      "children",
      (({Code}) =>
        Code !== undefined && !permissions.cube.includes(Code) && !permissions.cubeOwner.includes(Code))
    )
      .map(({Code}) => Code);
  const forbiddenCategoriesCodes =
    getNodes(
      categorisedCubes,
      "children",
      ({CatCode}) =>
        (CatCode !== undefined && permissions.categories.indexOf(CatCode) < 0)
    )
      .map(({CatCode}) => CatCode)
      .filter(catCode => catCode !== DCS_ORDERED_TREE_ROOT.CatCode && catCode !== UNCATEGORIZED_CATEGORY_CODE);
  return (
    <Call cb={fetchCategorisedCubes} disabled={categorisedCubes !== null}>
      <EnhancedTree
        tree={categorisedCubes}
        childrenKey="children"
        idKey="Code"
        nameKey="labels"
        catIdKey="CatCode"
        catNameKey="labels"
        unselectableKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
        hiddenIdKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
        unallowedIdKeys={forbiddenCubesCodes.concat(forbiddenCategoriesCodes)}
        getFilter={
          searchText =>
            ({Code, CatCode, labels}) => {
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
        actions={[
          {
            disabled: selectedCategoryId === null || permissions.categories.indexOf(selectedCategoryCode) < 0,
            title: t('scenes.dataManager.builder.cubeTree.createButton.title'),
            icon: 'plus',
            onClick: () => onCubeCreate(selectedCategoryId)
          },
          {
            disabled: selectedCubeId === null,
            title: t('scenes.dataManager.builder.cubeTree.deleteButton.title'),
            icon: 'delete',
            onClick: () => Modal.confirm({
              title: t('scenes.dataManager.builder.cubeTree.deleteButton.confirm'),
              onOk() {
                onCubeDelete(selectedCubeId);
              },
              cancelText: t('commons.buttons.cancel.title')
            })
          }
        ]}
        onSelect={
          selectedArr => {
            if (selectedArr !== null && selectedArr.length > 0) {
              const node = getNode(
                categorisedCubes,
                'children',
                node => node.children
                  ? node.CatCode === selectedArr[0]
                  : node.Code === selectedArr[0]
              );
              if (node && node.children) {
                onCategorySelect(node.IDCat, node.CatCode);
                if (permissions.categories.indexOf(node.CatCode) < 0) {
                  Modal.error({
                    title: t('scenes.dataManager.builder.cubeTree.modals.forbiddenCategory.title'),
                    content: t('scenes.dataManager.builder.cubeTree.modals.forbiddenCategory.content')
                  })
                }
              } else {
                onCategorySelect(null, null);
              }
              onCubeSelect((node && !node.children && !forbiddenCubesCodes.includes(node.Code)) ? node.IDCube : null);
              if (node && forbiddenCubesCodes.includes(node.Code)) {
                Modal.error({
                  title: t('scenes.dataManager.builder.cubeTree.modals.forbiddenNode.title'),
                  content: t('scenes.dataManager.builder.cubeTree.modals.forbiddenNode.content')
                });
              }
            } else {
              onCategorySelect(null, null);
              onCubeSelect(null);
            }
          }
        }
        treeActions={[
          {
            title: t('scenes.dataManager.builder.cubeTree.refreshButton.title'),
            icon: 'sync',
            onClick: onUpdateCategorisedCubes,
          }
        ]}
        icon="cube"
        isCustomIcon
        getIconColor={() => "#37a0f4"}
        searchBarSpan={SPAN_HALF}
      />
    </Call>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(BuilderCategorisedCubesTree);
