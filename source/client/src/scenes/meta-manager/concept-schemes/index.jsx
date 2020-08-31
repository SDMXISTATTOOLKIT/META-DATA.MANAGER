import React, {Fragment} from 'react';
import ConceptSchemesList from "./List";
import {connect} from "react-redux";
import ReduxConceptSchemeDetailModal from "../../../redux-components/redux-concept-scheme-detail-modal";
import {MM_CONCEPT_SCHEMES_PREFIX} from "./reducer";

const mapStateToProps = state => ({
  conceptSchemeDetail: state.scenes.metaManager.conceptSchemes.conceptSchemeDetail
});

const ConceptSchemes = ({
                          conceptSchemeDetail,
                        }) =>
  <Fragment>
    <ConceptSchemesList/>
    <ReduxConceptSchemeDetailModal
      instancePrefix={MM_CONCEPT_SCHEMES_PREFIX}
      instanceState={conceptSchemeDetail}
    />
  </Fragment>;

export default connect(mapStateToProps)(ConceptSchemes);
