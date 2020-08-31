import Call from "../../../hocs/call";
import EnhancedTree from "../../../components/enhanced-tree";
import {getUrnFromArtefact, SDMX_JSON_DATAFLOW_URN_NAMESPACE} from "../../../utils/sdmxJson";
import {getNodes, UNCATEGORIZED_CATEGORY_CODE} from "../../../utils/tree";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {
  categoriseCategorySchemesAndDataflowsDataflow,
  deleteCategorySchemesAndDataflowsDataflowCategorisation,
  readCategorySchemesAndDataflowsTree
} from "./actions";
import {Modal} from "antd";
import "./style.css"
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";
import {categorisationsSorterFactory} from "./utils";

const mapStateToProps = state => ({
  tree: state.scenes.metaManager.categorySchemesAndDataflows.tree,
  categorisations: state.scenes.metaManager.categorySchemesAndDataflows.categorisations,
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
});

const mapDispatchToProps = dispatch => ({
  fetchTree: lang => dispatch(readCategorySchemesAndDataflowsTree(lang)),
  onDataflowCategorise: (dataflow, categoryUrn, categorisations, from, to, fromSisterDfOrderedCategorisations, toSisterDfOrderedCategorisations, lang, orderAnnotationType) =>
    dispatch(categoriseCategorySchemesAndDataflowsDataflow(dataflow, categoryUrn, categorisations, from, to, fromSisterDfOrderedCategorisations, toSisterDfOrderedCategorisations, lang, orderAnnotationType)),
  onDeleteDataflowCategorisation: (dataflow, categorisations) =>
    dispatch(deleteCategorySchemesAndDataflowsDataflowCategorisation(dataflow, categorisations))
});

const onDrop = (ev, onDataflowCategorise, categorisations, t, lang, orderAnnotationType) => {

  if (ev.dragNode.props["data-node"].type === "dataflow") {

    const pos = ev.node.props.pos.split('-');
    const dropPos = ev.dropPosition - Number(pos[pos.length - 1]);

    let fromSisterDfOrderedCategorisations =
      categorisations
        .filter(({source, target}) =>
          source.includes(SDMX_JSON_DATAFLOW_URN_NAMESPACE) &&
          target === ev.dragNode.props["data-node"].categoryUrn
        )
        .sort(categorisationsSorterFactory(orderAnnotationType, lang));
    const toSisterDfOrderedCategorisations =
      categorisations
        .filter(({source, target}) =>
          source.includes(SDMX_JSON_DATAFLOW_URN_NAMESPACE) &&
          (target === (ev.dropToGap ? ev.node.props["data-node"].categoryUrn : ev.node.props["data-node"].urn))
        )
        .sort(categorisationsSorterFactory(orderAnnotationType, lang));

    let from = fromSisterDfOrderedCategorisations.map(({source}) => source).indexOf(ev.dragNode.props["data-node"].urn);
    let to = toSisterDfOrderedCategorisations.map(({source}) => source).indexOf(ev.node.props["data-node"].urn);

    if (ev.dropToGap) {

      const dataflow = ev.dragNode.props["data-node"];
      const categoryUrn = ev.node.props["data-node"].categoryUrn;

      if (categoryUrn === dataflow.categoryUrn) {

        // same category

        fromSisterDfOrderedCategorisations = [];

        to = from < to
          ? dropPos < 0 // moving forward into the array
            ? to - 1 // dropPos = -1 => drag on top node gap
            : to // dropPos = 1 => drag on bottom node gap
          : dropPos < 0 // moving backwards into the array
            ? to // dropPos = -1 => drag on top node gap
            : to + 1; // dropPos = 1 => drag on bottom node gap
        if (to === -1) {
          to = 0
        }
        if (to === toSisterDfOrderedCategorisations.length + 1) {
          to = toSisterDfOrderedCategorisations.length
        }

      } else {

        // other category

        to = dropPos < 0 // moving backwards into the array
          ? to // dropPos = -1 => drag on top node gap
          : to + 1; // dropPos = 1 => drag on bottom node gap;
        if (to === -1) {
          to = 0
        }
        if (to === toSisterDfOrderedCategorisations.length + 1) {
          to = toSisterDfOrderedCategorisations.length
        }
      }

      categoryUrn
        ? onDataflowCategorise(dataflow, categoryUrn, categorisations, from, to, fromSisterDfOrderedCategorisations, toSisterDfOrderedCategorisations, lang, orderAnnotationType)
        : Modal.error({title: t("scenes.metaManager.categorySchemesDataflowsTree.errors.notValidCategory.title")});

    } else {

      const categoryUrn = ev.node.props["data-node"].urn;
      categoryUrn && ev.node.props["data-node"].type === "category"
        ? onDataflowCategorise(ev.dragNode.props["data-node"], categoryUrn, categorisations, from, 0, fromSisterDfOrderedCategorisations, toSisterDfOrderedCategorisations, lang, orderAnnotationType)
        : Modal.error({title: t("scenes.metaManager.categorySchemesDataflowsTree.errors.notValidCategory.title")});
    }
  } else {
    Modal.error({title: t("scenes.metaManager.categorySchemesDataflowsTree.errors.canDragOnlyDataflow.title")});
  }
};

const CategorySchemesAndDataflows = ({
                                       t,
                                       tree,
                                       categorisations,
                                       nodes,
                                       nodeId,
                                       appLanguage,
                                       dataLanguages,
                                       fetchTree,
                                       onDataflowCategorise,
                                       onDeleteDataflowCategorisation
                                     }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;
      const orderAnnotationType = nodes.find(node => node.general.id === nodeId).annotations.categorisationsOrder;
      return (
        <Call
          cb={fetchTree}
          cbParam={lang}
          disabled={!(nodes && nodes.length > 0 && tree === null)}
        >
          <div className="category-schemes-and-dataflows__categorisation__tree">
            <EnhancedTree
              tree={tree}
              getNodeKey={node => node.id === UNCATEGORIZED_CATEGORY_CODE ? UNCATEGORIZED_CATEGORY_CODE : getUrnFromArtefact(node)}
              childrenKey="categories"
              idKey="id"
              nameKey="name"
              catIdKey="id"
              catNameKey="name"
              defaultCollapsed
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
              hiddenIdKeys={[UNCATEGORIZED_CATEGORY_CODE]}
              icon="file-text"
              getIconColor={() => "#37a0f4"}
              treeActions={[
                {
                  title: t('scenes.metaManager.categorySchemesDataflowsTree.tree.refreshButton.title'),
                  icon: 'sync',
                  onClick: () => fetchTree(lang)
                }
              ]}
              draggable
              unselectableKeys={[
                ...getNodes(tree, 'categories', () => true)
                  .map(node =>
                    node.id === UNCATEGORIZED_CATEGORY_CODE ? UNCATEGORIZED_CATEGORY_CODE : getUrnFromArtefact(node)
                  )
              ]}
              onDrop={ev => onDrop(ev, onDataflowCategorise, categorisations, t, lang, orderAnnotationType)}
              rightClickActions={[
                node => (node.type === "dataflow" && node.categoryUrn)
                  ? ({
                    icon: 'disconnect',
                    title: t('scenes.metaManager.categorySchemesDataflowsTree.tree.actions.deleteCategorisation.title'),
                    onClick: () => onDeleteDataflowCategorisation(node, categorisations)
                  })
                  : null
              ]}
            />
          </div>
        </Call>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CategorySchemesAndDataflows);

