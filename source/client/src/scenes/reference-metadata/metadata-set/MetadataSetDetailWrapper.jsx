import React from 'react';
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {
  changeMetadataSetMetadataSet,
  hideMetadataSetMetadataflows,
  readMetadataSetConceptSchemes,
  readMetadataSetMetadataflows,
  readMetadataSetMetadataSet,
  setMetadataSetMetadataflow,
  showMetadataSetMetadataflows,
  submitMetadataSetMetadataSet,
  unsetMetadataSetMetadataflow
} from "./actions";
import "./style.css"
import Call from "../../../hocs/call";
import MetadataSetDetail, {
  isMetadataSetIdWarningVisible,
  METADATA_SET_DETAIL_MODE_CREATE,
  METADATA_SET_DETAIL_MODE_EDIT,
  METADATA_SET_DETAIL_MODE_READ
} from "../commons/MetadataSetDetail";
import {Button, Card, Col, Row} from "antd";
import {isDateValid, isDictionaryValid} from "../../../utils/artefactValidators";
import {MARGIN_MD} from "../../../styles/constants";
import {getDbIdAnnotationFromAnnotations, METADATA_SET_ID_ANNOTATION_ID} from "../../../utils/referenceMetadata";

const mapStateToProps = state => ({
  permissions: state.app.user.permissions,
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages,
  metadataSetId: state.scenes.referenceMetadata.metadataSet.metadataSetId,
  msdTriplet: state.scenes.referenceMetadata.metadataSet.msdTriplet,
  metadataSet: state.scenes.referenceMetadata.metadataSet.metadataSet,
  isMetadataflowsVisible: state.scenes.referenceMetadata.metadataSet.isMetadataflowsVisible,
  metadataflows: state.scenes.referenceMetadata.metadataSet.metadataflows,
  categoryUrn: state.scenes.referenceMetadata.metadataSet.categoryUrn,
  isFetchMetadataSetDisabled: state.scenes.referenceMetadata.metadataSet.isFetchMetadataSetDisabled,
  conceptSchemeTriplets: state.scenes.referenceMetadata.metadataSet.conceptSchemeTriplets,
  metadataSets: state.scenes.referenceMetadata.metadataSet.metadataSets,
  metadataSetTree: state.scenes.referenceMetadata.metadataSet.metadataSetTree
});

const mapDispatchToProps = dispatch => ({
  fetchMetadataSet: ({metadataSetId, msdTriplet}) => dispatch(readMetadataSetMetadataSet(metadataSetId, msdTriplet)),
  onMetadataSetChange: fields => dispatch(changeMetadataSetMetadataSet(fields)),
  onMetadataSetSubmit: (metadataSet, categoryUrn) => dispatch(submitMetadataSetMetadataSet(metadataSet, categoryUrn)),
  onMetadataflowsShow: () => dispatch(showMetadataSetMetadataflows()),
  onMetadataflowsHide: () => dispatch(hideMetadataSetMetadataflows()),
  fetchMetadataflows: ownedMetadataflows => dispatch(readMetadataSetMetadataflows(ownedMetadataflows)),
  onMetadataflowSet: (triplet, msdUrn) => dispatch(setMetadataSetMetadataflow(triplet, msdUrn)),
  onMetadataflowUnset: () => dispatch(unsetMetadataSetMetadataflow()),
  fetchConceptSchemes: ({conceptSchemeTriplets, appLang, dataLangs}) =>
    dispatch(readMetadataSetConceptSchemes(conceptSchemeTriplets, appLang, dataLangs))
});

const MetadataSetDetailWrapper = ({
                                    t,
                                    permissions,
                                    appLang,
                                    dataLangs,
                                    hasPermission,
                                    metadataSetId,
                                    msdTriplet,
                                    metadataSet,
                                    isMetadataflowsVisible,
                                    metadataflows,
                                    categoryUrn,
                                    isFetchMetadataSetDisabled,
                                    metadataSets,
                                    metadataSetTree,
                                    fetchMetadataSet,
                                    onMetadataSetChange,
                                    onMetadataSetSubmit,
                                    onMetadataflowsShow,
                                    onMetadataflowsHide,
                                    fetchMetadataflows,
                                    onMetadataflowSet,
                                    onMetadataflowUnset,
                                    conceptSchemeTriplets,
                                    fetchConceptSchemes
                                  }) =>
  <Call
    cb={fetchMetadataSet}
    cbParam={{metadataSetId, msdTriplet}}
    disabled={metadataSetId === null || isFetchMetadataSetDisabled || metadataSetTree === null}
  >
    <Call
      cb={fetchConceptSchemes}
      cbParam={{conceptSchemeTriplets, appLang, dataLangs}}
      disabled={conceptSchemeTriplets === null || metadataSetTree === null}
    >
      <Card type="inner" bodyStyle={{height: 630, overflow: "auto"}}>
        <MetadataSetDetail
          mode={(metadataSet && !!getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID))
            ? hasPermission
              ? METADATA_SET_DETAIL_MODE_EDIT
              : METADATA_SET_DETAIL_MODE_READ
            : METADATA_SET_DETAIL_MODE_CREATE
          }
          metadataSet={metadataSet}
          metadataSets={metadataSets}
          onMetadataSetChange={onMetadataSetChange}
          isMetadataflowsVisible={isMetadataflowsVisible}
          metadataflows={metadataflows}
          onMetadataflowsShow={onMetadataflowsShow}
          onMetadataflowsHide={onMetadataflowsHide}
          fetchMetadataflows={fetchMetadataflows}
          onMetadataflowSet={onMetadataflowSet}
          onMetadataflowUnset={onMetadataflowUnset}
        />
      </Card>
      {
        hasPermission && (
          <Row type="flex" justify="end" style={{marginTop: MARGIN_MD}}>
            <Col>
              <Button
                onClick={() => onMetadataSetSubmit(metadataSet, categoryUrn)}
                type="primary"
                disabled={
                  !metadataSet.id || metadataSet.id.length === 0 ||
                  isMetadataSetIdWarningVisible(metadataSet, metadataSets) ||
                  !isDictionaryValid(metadataSet.name) ||
                  !metadataSet.metadataflowTriplet ||
                  !metadataSet.structureRef ||
                  (metadataSet.reportingBegin !== null && metadataSet.reportingEnd !== null && !isDateValid(metadataSet.reportingBegin, metadataSet.reportingEnd)) ||
                  (metadataSet.validFrom !== null && metadataSet.validTo !== null && !isDateValid(metadataSet.validFrom, metadataSet.validTo))
                }
              >
                {t("commons.buttons.save.title")}
              </Button>
            </Col>
          </Row>
        )
      }
    </Call>
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(MetadataSetDetailWrapper);