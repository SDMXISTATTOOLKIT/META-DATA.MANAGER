import React, {Fragment} from 'react';
import {DSD_COMPONENT_TYPE_ATTRIBUTE, DSD_COMPONENT_TYPE_DIMENSION, DSD_COMPONENT_TYPE_GROUP} from "./ComponentForm";
import {translate} from 'react-i18next';
import {
  DSD_DIMENSION_TYPE_FREQUENCY,
  DSD_DIMENSION_TYPE_MEASURE,
  DSD_DIMENSION_TYPE_NORMAL,
  getArtefactTripletFromString,
  getArtefactTripletFromUrn,
  getQuartupletFromItemString,
  getStringFromArtefactTriplet,
  getStringFromItemUrn
} from "../../../utils/sdmxJson";
import {ARTEFACT_FORM_MODE_READ} from "../../../components/artefact-form";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import LayoutAnnotationList from "../../../components/layout-annotation-list";
import {getSdmxDimensionTypesTranslations} from "./getSdmxDimensionTypesTranslations";
import {getSdmxAttributeAttachmentLevelTranslations} from "./getSdmxAttributeAttachmentLevelTranslations";
import {
  BUTTON_CUSTOM_ANNOTATIONS,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_LAYOUT_ANNOTATIONS
} from "../../../styles/buttons";
import {countCustomAnnotations, countLayoutAnnotations} from "../../../utils/annotations";
import {connect} from "react-redux";
import {compose} from "redux";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import {TABLE_COL_MIN_WIDTH_ID} from "../../../styles/constants";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  username: state.app.user.username
});

class ComponentList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      annotationsComponentId: null,
      layoutAnnotationsComponentId: null,
    };

    this.showAnnotations = this.showAnnotations.bind(this);
    this.hideAnnotations = this.hideAnnotations.bind(this);
    this.showLayoutAnnotations = this.showLayoutAnnotations.bind(this);
    this.hideLayoutAnnotations = this.hideLayoutAnnotations.bind(this);
  }

  showAnnotations(componentId) {
    this.setState({
      annotationsComponentId: componentId
    });
  }

  hideAnnotations() {
    this.setState({
      annotationsComponentId: null
    });
  }

  showLayoutAnnotations(componentId) {
    this.setState({
      layoutAnnotationsComponentId: componentId
    });
  }

  hideLayoutAnnotations() {
    this.setState({
      layoutAnnotationsComponentId: null
    });
  }

  render() {

    const {
      t,
      components,
      onDetail,
      onCodelistDetail,
      onConceptDetail,
      onConceptSchemeDetail,
      onDelete,
      mode,
      type,
      endpoints,
      endpointId,
      username
    } = this.props;

    const {
      annotationsComponentId
    } = this.state;

    const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
    const customAnnotationsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;

    return (
      <Fragment>
        <InfiniteScrollTable
          data={
            components &&
            components
              .map(comp => ({
                ...comp,
                concept: comp.concept
                  ? getStringFromItemUrn(comp.concept)
                  : null,
                representation: comp.representation
                  ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(comp.representation))
                  : null,
                groupDimensions: comp.groupDimensions
                  ? comp.groupDimensions.join(", ")
                  : null
              }))
              .sort((a, b) =>
                a.order && b.order && a.order !== b.order
                  ? a.order - b.order
                  : a.id - b.id
              )
          }
          getRowKey={({id}) => id}
          columns={[]
            .concat((type === DSD_COMPONENT_TYPE_DIMENSION || type === DSD_COMPONENT_TYPE_ATTRIBUTE)
              ? {
                title: t('data.dsd.component.order.shortLabel'),
                dataIndex: 'order',
                widthToContent: true
              }
              : []
            )
            .concat(
              {
                title: t('data.dsd.component.id.shortLabel'),
                dataIndex: 'id',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              }
            )
            .concat((type === DSD_COMPONENT_TYPE_DIMENSION || type === DSD_COMPONENT_TYPE_ATTRIBUTE)
              ? [
                {
                  title: t('data.dsd.component.concept.shortLabel'),
                  dataIndex: 'concept',
                  minWidth: 150,
                  render: concept =>
                    <div
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      onClick={() => onConceptDetail(getQuartupletFromItemString(concept))}
                    >
                      {concept}
                    </div>
                },
                {
                  title: t('data.dsd.component.representation.shortLabel'),
                  dataIndex: 'representation',
                  minWidth: 150,
                  render: (representation, row) =>
                    <div
                      style={{
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      onClick={() => {
                        if (representation) {
                          if (onCodelistDetail && (
                            type === DSD_COMPONENT_TYPE_ATTRIBUTE ||
                            row.type === DSD_DIMENSION_TYPE_NORMAL ||
                            row.type === DSD_DIMENSION_TYPE_FREQUENCY
                          )) {
                            onCodelistDetail(getArtefactTripletFromString(representation));
                          } else if (onConceptSchemeDetail && row.type === DSD_DIMENSION_TYPE_MEASURE) {
                            onConceptSchemeDetail(getArtefactTripletFromString(representation));
                          }
                        } else {
                          return null;
                        }
                      }}
                    >
                      {representation}
                    </div>
                }
              ]
              : []
            )
            .concat(type === DSD_COMPONENT_TYPE_GROUP
              ? {
                title: t('data.dsd.group.dimensions.shortLabel'),
                dataIndex: 'groupDimensions',
                minWidth: 200
              }
              : []
            )
            .concat(type === DSD_COMPONENT_TYPE_DIMENSION
              ? {
                title: t('data.dsd.dimension.type.shortLabel'),
                dataIndex: 'type',
                widthToContent: true,
                withValuesFilter: true,
                render: type => getSdmxDimensionTypesTranslations(t)[type],
                renderText: type => getSdmxDimensionTypesTranslations(t)[type]
              }
              : []
            )
            .concat(type === DSD_COMPONENT_TYPE_ATTRIBUTE
              ? [
                {
                  title: t('data.dsd.attribute.assignmentStatus.shortLabel'),
                  dataIndex: 'assignmentStatus',
                  widthToContent: true,
                  withValuesFilter: true
                },
                {
                  title: t('data.dsd.attribute.attachmentLevel.shortLabel'),
                  dataIndex: 'attachmentLevel',
                  widthToContent: true,
                  withValuesFilter: true,
                  render: level => getSdmxAttributeAttachmentLevelTranslations(t)[level],
                  renderText: level => getSdmxAttributeAttachmentLevelTranslations(t)[level]
                }
              ]
              : []
            )
          }
          actions={[]
            .concat(onDetail
              ? {
                ...BUTTON_DETAIL,
                title: mode !== ARTEFACT_FORM_MODE_READ
                  ? t('components.dsdDetail.componentList.actions.detail')
                  : t('components.dsdDetail.componentList.actions.detailReadOnly'),
                onClick: onDetail
              }
              : []
            )
            .concat((onDelete && mode !== ARTEFACT_FORM_MODE_READ)
              ? {
                ...BUTTON_DELETE,
                title: t('components.dsdDetail.componentList.actions.delete'),
                onClick: onDelete
              }
              : []
            )
          }
          fixedActions={[]
            .concat(({id, annotations}) => {
              const customAnnotationsCount = countCustomAnnotations(annotations, customAnnotationsConfig);
              return customAnnotationsCount > 0
                ? {
                  ...BUTTON_CUSTOM_ANNOTATIONS,
                  title: t('commons.actions.customAnnotations.title') + ": " + customAnnotationsCount,
                  onClick: () => this.showAnnotations(id)
                }
                : null
            })
            .concat(username
              ? ({id, annotations}) => {
                const layoutAnnotationsCount = countLayoutAnnotations(annotations, annotationsConfig);
                return (layoutAnnotationsCount > 0)
                  ? {
                    ...BUTTON_LAYOUT_ANNOTATIONS,
                    title: t('commons.actions.layoutAnnotations.title') + ": " + layoutAnnotationsCount,
                    onClick: () => this.showLayoutAnnotations(id)
                  }
                  : null
              }
              : []
            )
          }
        />
        <CustomAnnotationList
          annotations={
            annotationsComponentId
              ? (
                components.find(({id}) => annotationsComponentId === id).annotations
              )
              : null
          }
          onClose={this.hideAnnotations}
        />
        <LayoutAnnotationList
          annotations={
            annotationsComponentId
              ? (
                components.find(({id}) => annotationsComponentId === id).annotations
              )
              : null
          }
          onClose={this.hideLayoutAnnotations}
        />
      </Fragment>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(ComponentList);
