import React from 'react';
import {translate} from 'react-i18next';
import {Button, Col, Modal, Row, Tabs} from 'antd';
import ArtefactForm, {ARTEFACT_FORM_MODE_CREATE, ARTEFACT_FORM_MODE_READ} from '../../../components/artefact-form';
import ComponentForm, {
  DSD_COMPONENT_TYPE_ATTRIBUTE,
  DSD_COMPONENT_TYPE_DIMENSION,
  DSD_COMPONENT_TYPE_GROUP,
  DSD_COMPONENT_TYPE_MEASURE
} from "./ComponentForm";
import ComponentList from "./ComponentList";

const DSD_DETAIL_TAB_GENERAL = 'DSD_DETAIL_TAB_GENERAL';
const DSD_DETAIL_TAB_PRIMARY_MEASURE = 'DSD_DETAIL_TAB_PRIMARY_MEASURE';
const DSD_DETAIL_TAB_DIMENSIONS = 'DSD_DETAIL_TAB_DIMENSIONS';

const DsdDetail = ({
                     t,
                     dsd,
                     mode,
                     isComponentsDisabled,
                     agencies,
                     activeTab = DSD_DETAIL_TAB_GENERAL,
                     onDimensionDetail,
                     onDimensionCreate,
                     onDimensionDelete,
                     onGroupDetail,
                     onGroupCreate,
                     onGroupDelete,
                     onAttributeDetail,
                     onAttributeCreate,
                     onAttributeDelete,
                     onCodelistDetail,
                     onConceptDetail,
                     onConceptSchemeDetail,
                     onGeneralChange,
                     onPrimaryMeasureChange,
                     onPrimaryMeasureConceptSelect,
                     onPrimaryMeasureCodelistSelect
                   }) =>
  <Tabs
    defaultActiveKey={activeTab}
    onTabClick={key => key === "categorisations" ? Modal.error({title: t('errors.notImplemented')}) : null}
  >
    <Tabs.TabPane key={DSD_DETAIL_TAB_GENERAL} tab={t('components.dsdDetail.tabs.general.title')}>
      <ArtefactForm
        artefact={dsd}
        mode={mode}
        agencies={agencies}
        onChange={onGeneralChange}
        dsdDimensions={mode !== ARTEFACT_FORM_MODE_CREATE ? dsd && dsd.dimensions : undefined}
        dsdAttributes={mode !== ARTEFACT_FORM_MODE_CREATE ? dsd && dsd.attributes : undefined}
      />
    </Tabs.TabPane>
    <Tabs.TabPane key={DSD_DETAIL_TAB_PRIMARY_MEASURE} tab={t('components.dsdDetail.tabs.primaryMeasure.title')}>
      <ComponentForm
        component={dsd && dsd.primaryMeasure}
        mode={isComponentsDisabled ? ARTEFACT_FORM_MODE_READ : mode}
        type={DSD_COMPONENT_TYPE_MEASURE}
        onChange={onPrimaryMeasureChange}
        onConceptSelect={onPrimaryMeasureConceptSelect}
        onCodelistSelect={onPrimaryMeasureCodelistSelect}
      />
    </Tabs.TabPane>
    <Tabs.TabPane key={DSD_DETAIL_TAB_DIMENSIONS} tab={t('components.dsdDetail.tabs.dimensions.title')}>
      {onDimensionCreate && !isComponentsDisabled && mode !== ARTEFACT_FORM_MODE_READ && (
        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" icon="plus" onClick={onDimensionCreate}>
              {t('components.dsdDetail.buttons.createComponent')}
            </Button>
          </Col>
        </Row>
      )}
      <ComponentList
        mode={isComponentsDisabled ? ARTEFACT_FORM_MODE_READ : mode}
        type={DSD_COMPONENT_TYPE_DIMENSION}
        onDetail={onDimensionDetail}
        onDelete={onDimensionDelete}
        onConceptDetail={onConceptDetail}
        onCodelistDetail={onCodelistDetail}
        onConceptSchemeDetail={onConceptSchemeDetail}
        components={dsd ? (dsd.dimensions || []) : null}
      />
    </Tabs.TabPane>
    <Tabs.TabPane key="groups" tab={t('components.dsdDetail.tabs.groups.title')}>
      {onGroupCreate && !isComponentsDisabled && mode !== ARTEFACT_FORM_MODE_READ && (
        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" icon="plus" onClick={onGroupCreate}>
              {t('components.dsdDetail.buttons.createComponent')}
            </Button>
          </Col>
        </Row>
      )}
      <ComponentList
        mode={isComponentsDisabled ? ARTEFACT_FORM_MODE_READ : mode}
        type={DSD_COMPONENT_TYPE_GROUP}
        onDetail={onGroupDetail}
        onDelete={onGroupDelete}
        components={dsd ? (dsd.groups || []) : null}
      />
    </Tabs.TabPane>
    <Tabs.TabPane key="attributes" tab={t('components.dsdDetail.tabs.attributes.title')}>
      {onAttributeCreate && !isComponentsDisabled && mode !== ARTEFACT_FORM_MODE_READ && (
        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" icon="plus" onClick={onAttributeCreate}>
              {t('components.dsdDetail.buttons.createComponent')}
            </Button>
          </Col>
        </Row>
      )}
      <ComponentList
        mode={isComponentsDisabled ? ARTEFACT_FORM_MODE_READ : mode}
        type={DSD_COMPONENT_TYPE_ATTRIBUTE}
        onDetail={onAttributeDetail}
        onDelete={onAttributeDelete}
        components={dsd ? (dsd.attributes || []) : null}
        onConceptDetail={onConceptDetail}
        onCodelistDetail={onCodelistDetail}
      />
    </Tabs.TabPane>
    <Tabs.TabPane key="categorisations" tab={t('components.dsdDetail.tabs.categorisations.title')}/>
  </Tabs>;

export default translate()(DsdDetail);
