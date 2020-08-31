import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Alert, Card, Modal, Tabs} from "antd";
import "./style.css";
import DefaultTableLayout from "../annotations-form/DefaultTableLayout";
import _ from "lodash";
import {
  getCustomAnnotationsFromTabsMap,
  getCustomAnnotationsTabsMap,
  getGenericAnnotations,
  getLayoutAnnotations
} from "../../utils/annotations";
import GeneralParameters from "./GeneralParameters";
import LayoutAnnotationNotDisplayed from "../annotations-form/NotDisplayed";
import Default from "../annotations-form/Default";
import {MARGIN_MD} from "../../styles/constants";

const LAYOUT_ANNOTATIONS_FORM_TAB_NOT_DISPLAYED_ITEMS_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_NOT_DISPLAYED_ITEMS_KEY";
const LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_ITEMS_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_ITEMS_KEY";
const LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_TABLE_LAYOUT_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_TABLE_LAYOUT_KEY";
const LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_CHART_LAYOUT_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_CHART_LAYOUT_KEY";
const LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_MAP_LAYOUT_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_MAP_LAYOUT_KEY";
const LAYOUT_ANNOTATIONS_FORM_TAB_GENERAL_PARAMS_KEY = "LAYOUT_ANNOTATIONS_FORM_TAB_GENERAL_PARAMS_KEY";

const LayoutAnnotationsForm = ({
                                 t,
                                 disabled,
                                 dsdDimensions,
                                 dsdAttributes,
                                 endpoints,
                                 endpointId,
                                 annotations,
                                 itemsPage,
                                 fetchItemsPage,
                                 resetItemsPage
                               }, ref) => {

  const annotationTabsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;
  const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
  const layoutAnnotations = getLayoutAnnotations(annotations, annotationsConfig);

  const [tempAnnotations, setTempAnnotations] = useState([
    ..._.cloneDeep(getGenericAnnotations(annotations, annotationTabsConfig, annotationsConfig)),
    ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(annotations, annotationTabsConfig))),
    ..._.cloneDeep(layoutAnnotations)
  ]);

  const generalParamsRef = useRef();

  useImperativeHandle(ref, () => ({
    submit(cb) {
      generalParamsRef.current.submit(tempAnnotations, newAnnotations => cb(newAnnotations));
    }
  }));

  return (
    <div className="layout-annotations-form">
      {annotations.find(annot => annot.title && annot.title.length > 4000) && (
        <Alert
          type="warning"
          showIcon
          message={t("components.layoutAnnotationsForm.alerts.titleTooLong")}
          style={{marginBottom: MARGIN_MD}}
        />
      )}
      <Tabs
        onTabClick={key => {
          if (
            key === LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_CHART_LAYOUT_KEY ||
            key === LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_MAP_LAYOUT_KEY
          ) {
            Modal.error({title: t('errors.notImplemented')})
          }
        }}
      >
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_NOT_DISPLAYED_ITEMS_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.notDisplayedItems.title')}
        >
          <Card>
            <LayoutAnnotationNotDisplayed
              disabled={disabled}
              dsdDimensions={dsdDimensions}
              dsdAttributes={dsdAttributes}
              layoutAnnotations={tempAnnotations}
              onChange={({layoutAnnotations}) => setTempAnnotations([
                ..._.cloneDeep(getGenericAnnotations(tempAnnotations, annotationTabsConfig, annotationsConfig)),
                ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(tempAnnotations, annotationTabsConfig))),
                ..._.cloneDeep(layoutAnnotations)
              ])}
              annotationsConfig={annotationsConfig}
              fetchItemsPage={fetchItemsPage}
              itemsPage={itemsPage}
              resetItemsPage={resetItemsPage}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_ITEMS_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.defaultItems.title')}
        >
          <Card>
            <Default
              disabled={disabled}
              dsdDimensions={dsdDimensions}
              layoutAnnotations={tempAnnotations}
              onChange={({layoutAnnotations}) => setTempAnnotations([
                ..._.cloneDeep(getGenericAnnotations(tempAnnotations, annotationTabsConfig, annotationsConfig)),
                ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(tempAnnotations, annotationTabsConfig))),
                ..._.cloneDeep(layoutAnnotations)
              ])}
              annotationsConfig={annotationsConfig}
              fetchItemsPage={fetchItemsPage}
              itemsPage={itemsPage}
              resetItemsPage={resetItemsPage}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_TABLE_LAYOUT_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.defaultTableLayout.title')}
        >
          <Card>
            <DefaultTableLayout
              disabled={disabled}
              dsdDimensions={dsdDimensions}
              annotationsConfig={annotationsConfig}
              layoutAnnotations={tempAnnotations}
              onChange={({layoutAnnotations}) => setTempAnnotations([
                ..._.cloneDeep(getGenericAnnotations(tempAnnotations, annotationTabsConfig, annotationsConfig)),
                ..._.cloneDeep(getCustomAnnotationsFromTabsMap(getCustomAnnotationsTabsMap(tempAnnotations, annotationTabsConfig))),
                ..._.cloneDeep(layoutAnnotations)
              ])}
            />
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_CHART_LAYOUT_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.defaultChartLayout.title')}
        >
        </Tabs.TabPane>
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_DEFAULT_MAP_LAYOUT_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.defaultMapLayout.title')}
        >
        </Tabs.TabPane>
        <Tabs.TabPane
          key={LAYOUT_ANNOTATIONS_FORM_TAB_GENERAL_PARAMS_KEY}
          tab={t('components.layoutAnnotationsForm.tabs.generalParameters.title')}
          forceRender
        >
          <Card>
            <GeneralParameters
              t={t}
              disabled={disabled}
              dsdDimensions={dsdDimensions}
              annotationsConfig={annotationsConfig}
              annotations={tempAnnotations}
              ref={generalParamsRef}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
};

export default forwardRef(LayoutAnnotationsForm);