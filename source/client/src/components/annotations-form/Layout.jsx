import {countLayoutAnnotations} from "../../utils/annotations";
import React, {useRef} from "react";
import Call from "../../hocs/call";
import {getArtefactTripletFromUrn} from "../../utils/sdmxJson";
import {Button, Card, Col, Row} from "antd";
import {GUTTER_MD, MODAL_WIDTH_XL} from "../../styles/constants";
import EnhancedModal from "../enhanced-modal";
import LayoutAnnotationsForm from "../layout-annotations-form";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";

const Layout = ({
                  t,
                  disabled,
                  endpoints,
                  endpointId,
                  isFormVisible,
                  dataflow,
                  dsdForLayoutAnnotations,
                  onFormShow,
                  onFormHide,
                  onFormSubmit,
                  fetchDsdForLayoutAnnotations,
                  itemsPage,
                  fetchItemsPage,
                  resetItemsPage
                }) => {
  const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
  const hasLayoutAnnotations = dataflow && countLayoutAnnotations(dataflow.annotations, annotationsConfig) > 0;

  const formRef = useRef();

  return (
    <Call
      cb={fetchDsdForLayoutAnnotations}
      cbParam={dataflow && dataflow.structure ? getArtefactTripletFromUrn(dataflow.structure) : null}
      disabled={!dataflow || !dataflow.structure}
    >
      <Card type="inner">
        <Row type="flex" gutter={GUTTER_MD}>
          <Col>
            <Button type="primary" icon={hasLayoutAnnotations ? "file-text" : "plus"}
                    onClick={() => onFormShow(dataflow.annotations)}>
              {hasLayoutAnnotations ? t('commons.buttons.edit.title') : t('commons.buttons.create.title')}
            </Button>
          </Col>
          {/* {hasLayoutAnnotations && (
            <Col>
              <Button
                icon="delete"
                onClick={() => onFormReset([
                  ..._.cloneDeep(getGenericAnnotations(dataflow ? dataflow.annotations : [], annotationTabsConfig, annotationsConfig)),
                  ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(dataflow ? dataflow.annotations : [], annotationTabsConfig)))
                ])}
                disabled={disabled}
              >
                {t('commons.buttons.delete.title')}
              </Button>
            </Col>
          )}*/}
        </Row>
        <EnhancedModal
          visible={isFormVisible}
          title={t('scenes.dataManager.dataflowBuilder.wizard.layoutAnnotations.layoutAnnotationsForm.title')}
          width={MODAL_WIDTH_XL}
          onCancel={onFormHide}
          footer={
            <div>
              <Button onClick={onFormHide}>{t('commons.buttons.close.title')}</Button>
              <Button
                type="primary"
                disabled={disabled}
                onClick={() => {
                  formRef.current.submit(val => {
                    onFormSubmit(val);
                  });
                }}
              >
                {t('commons.buttons.save.title')}
              </Button>
            </div>
          }
        >
          <LayoutAnnotationsForm
            t={t}
            disabled={disabled}
            endpoints={endpoints}
            endpointId={endpointId}
            annotations={dataflow && dataflow.annotations}
            dsdDimensions={dsdForLayoutAnnotations && dsdForLayoutAnnotations.dimensions}
            dsdAttributes={dsdForLayoutAnnotations && dsdForLayoutAnnotations.attributes}
            ref={formRef}
            itemsPage={itemsPage}
            fetchItemsPage={fetchItemsPage}
            resetItemsPage={resetItemsPage}
          />
        </EnhancedModal>
      </Card>
    </Call>
  );
};

export default compose(
  translate(),
  connect(state => ({
    endpoints: state.config.nodes,
    endpointId: state.app.endpointId
  }))
)(Layout);