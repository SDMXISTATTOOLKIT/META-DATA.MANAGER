import React, {Fragment} from 'react';
import {MODAL_WIDTH_LG} from '../../styles/constants';
import Call from '../../hocs/call';
import {translate} from 'react-i18next';
import {
  hideDefaultCategorySchemeSelector,
  readDefaultCategorySchemeSelectorCategorySchemes,
  submitDefaultCategorySchemeSelector
} from './actions';
import {connect} from 'react-redux';
import {compose} from 'redux';
import EnhancedModal from '../../components/enhanced-modal';
import {Button} from "antd";
import ArtefactList from "../../components/artefact-list";
import ReduxCategorySchemeDetailModal from "../../redux-components/redux-category-scheme-detail-modal";
import {DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX} from "./reducer";
import {reuseAction} from "../../utils/reduxReuse";
import {showCategorySchemeDetail} from "../../redux-components/redux-category-scheme-detail-modal/actions";

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  isVisible: state.middlewares.defaultCategorySchemeSelector.isVisible,
  categorySchemes: state.middlewares.defaultCategorySchemeSelector.categorySchemes,
  categorySchemeDetail: state.middlewares.defaultCategorySchemeSelector.categorySchemeDetail
});

const mapDispatchToProps = dispatch => ({
  fetchCategorySchemes: () =>
    dispatch(readDefaultCategorySchemeSelectorCategorySchemes()),
  onHide: () => dispatch(hideDefaultCategorySchemeSelector()),
  onCategorySchemeShow: (categorySchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCategorySchemeDetail(categorySchemeTriplet, defaultItemsViewMode), DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX)),
  onSubmit: categorySchemeTriplet =>
    dispatch(submitDefaultCategorySchemeSelector(categorySchemeTriplet))
});

export const DefaultCategorySchemeSelector = ({
                                                t,
                                                nodes,
                                                nodeId,
                                                isVisible,
                                                categorySchemes,
                                                categorySchemeDetail,
                                                fetchCategorySchemes,
                                                onHide,
                                                onCategorySchemeShow,
                                                onSubmit
                                              }) => {

  const connectedNode = nodes.find(node => node.general.id === nodeId);
  const defaultItemsViewMode = connectedNode
    ? connectedNode.general.defaultItemsViewMode
    : null;

  return defaultItemsViewMode
    ? (
      <Fragment>
        <EnhancedModal
          visible={isVisible}
          title={t('middlewares.defaultCategorySchemeSelector.title')}
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>}
          onCancel={onHide}
          withDataLanguageSelector
        >
          <Call cb={fetchCategorySchemes}>
            <ArtefactList
              artefacts={categorySchemes}
              onDetailShow={triplet => onCategorySchemeShow(triplet, defaultItemsViewMode)}
              onRowClick={({id, agencyID, version}) => onSubmit({id, agencyID, version})}
            />
          </Call>
        </EnhancedModal>
        <ReduxCategorySchemeDetailModal
          instancePrefix={DEFAULT_CATEGORY_SCHEME_SELECTOR_PREFIX}
          instanceState={categorySchemeDetail}
        />
      </Fragment>
    )
    : <span/>
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DefaultCategorySchemeSelector);
