import React, {Fragment} from 'react';
import CategorySchemesList from "./List";
import {connect} from "react-redux";
import {MM_CATEGORY_SCHEMES_PREFIX} from "./reducer";
import ReduxCategorySchemeDetailModal from "../../../redux-components/redux-category-scheme-detail-modal";

const mapStateToProps = state => ({
  categorySchemeDetail: state.scenes.metaManager.categorySchemes.categorySchemeDetail
});

const CategorySchemes = ({
                           categorySchemeDetail
                         }) =>
  <Fragment>
    <CategorySchemesList/>
    <ReduxCategorySchemeDetailModal
      instancePrefix={MM_CATEGORY_SCHEMES_PREFIX}
      instanceState={categorySchemeDetail}
    />
  </Fragment>;

export default connect(mapStateToProps)(CategorySchemes);
