import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Card, Form, Modal, Tabs} from 'antd';
import _ from 'lodash';
import {MARGIN_MD} from "../../styles/constants";
import GenericAnnotationsForm from "./GenericAnnotationsForm";
import {
  countCustomAnnotations,
  countLayoutAnnotations,
  getCustomAnnotationsFromTabsMap,
  getCustomAnnotationsTabsMap,
  getGenericAnnotations,
  getLayoutAnnotations
} from "../../utils/annotations";
import {connect} from "react-redux";
import CustomAnnotationsForm from "./CustomAnnotationsForm";
import LayoutAnnotationNotDisplayed from "./NotDisplayed";
import LayoutAnnotationDefaultTableLayout from "./DefaultTableLayout";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import Layout from "./Layout";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  username: state.app.user.username,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const TAB_KEY_GENERAL = "TAB_KEY_GENERAL";
const TAB_KEY_LAYOUT_ANNOTATION_NOT_DISPLAYED = "TAB_KEY_LAYOUT_ANNOTATION_NOT_DISPLAYED";
const TAB_KEY_LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT = "TAB_KEY_LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT";

const AnnotationsForm = ({
                           t,
                           username,
                           appLanguage,
                           dataLanguages,
                           disabled,
                           annotations,
                           endpoints,
                           endpointId,
                           dsdDimensions,
                           dsdAttributes,
                           genericOnly,
                           isGenericOneLinePerField,
                           isDataflow,
                           onChange,
                           isLayoutAnnotationsFormVisible,
                           dataflow,
                           dsdForLayoutAnnotations,
                           onLayoutAnnotationsFormShow,
                           onLayoutAnnotationsFormHide,
                           onLayoutAnnotationsFormSubmit,
                           onLayoutAnnotationsFormReset,
                           fetchDsdForLayoutAnnotations,
                           itemsPageForLayoutAnnotations,
                           fetchItemsPageForLayoutAnnotations,
                           resetItemsPageForLayoutAnnotations
                         }) => {
  const annotationTabsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;
  const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
  const genericAnnotations = getGenericAnnotations(annotations, annotationTabsConfig, annotationsConfig);
  const tabsMap = getCustomAnnotationsTabsMap(annotations, annotationTabsConfig);
  const layoutAnnotations = getLayoutAnnotations(annotations, annotationsConfig);
  const callOnChange = (genericAnnotations, customAnnotationsTabsMap, layoutAnnotations) =>
    onChange({
      annotations: [
        ..._.cloneDeep(genericAnnotations),
        ..._.cloneDeep(getCustomAnnotationsFromTabsMap(customAnnotationsTabsMap)),
        ..._.cloneDeep(layoutAnnotations)
      ]
    });

  const GenericAnnotationsTab =
    <GenericAnnotationsForm
      disabled={disabled}
      annotations={genericAnnotations}
      onChange={({annotations: newGenericAnnotations}) => {
        if (
          countCustomAnnotations(newGenericAnnotations, annotationTabsConfig, true) > 0 ||
          countLayoutAnnotations(newGenericAnnotations, annotationsConfig) > 0
        ) {
          callOnChange(genericAnnotations, tabsMap, layoutAnnotations);
          Modal.error({
            title: t('components.annotationsForm.alerts.illegalAnnotationType.title'),
            content: t('components.annotationsForm.alerts.illegalAnnotationType.content')
          });
        } else {
          callOnChange(newGenericAnnotations, tabsMap, layoutAnnotations);
        }
      }}
      isOneLinePerField={isGenericOneLinePerField}
    />;

  const variableTabs = [];
  if (username && dsdDimensions !== undefined) {
    if (isDataflow) {
      variableTabs.push(
        <Tabs.TabPane
          key={TAB_KEY_LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT}
          tab={t('components.annotationsForm.cards.annotations.tabs.layoutAnnotations.title')}
          disabled={dsdDimensions === null}
        >
          <Layout
            disabled={disabled}
            isFormVisible={isLayoutAnnotationsFormVisible}
            dataflow={dataflow}
            dsdForLayoutAnnotations={dsdForLayoutAnnotations}
            onFormShow={onLayoutAnnotationsFormShow}
            onFormHide={onLayoutAnnotationsFormHide}
            onFormSubmit={onLayoutAnnotationsFormSubmit}
            onFormReset={onLayoutAnnotationsFormReset}
            fetchDsdForLayoutAnnotations={fetchDsdForLayoutAnnotations}
            itemsPage={itemsPageForLayoutAnnotations}
            fetchItemsPage={fetchItemsPageForLayoutAnnotations}
            resetItemsPage={resetItemsPageForLayoutAnnotations}
          />
        </Tabs.TabPane>
      );
    } else {
      variableTabs.push(
        <Tabs.TabPane
          key={TAB_KEY_LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT}
          tab={t('components.annotationsForm.cards.annotations.tabs.layoutAnnotationDefaultTableLayout.title')}
          disabled={dsdDimensions === null}
        >
          <LayoutAnnotationDefaultTableLayout
            disabled={disabled}
            dsdDimensions={dsdDimensions}
            layoutAnnotations={layoutAnnotations}
            onChange={({layoutAnnotations: newLayoutAnnotations}) => {
              callOnChange(genericAnnotations, tabsMap, newLayoutAnnotations);
            }}
            annotationsConfig={annotationsConfig}
          />
        </Tabs.TabPane>
      );
      if (dsdAttributes !== undefined) {
        variableTabs.push(
          <Tabs.TabPane
            key={TAB_KEY_LAYOUT_ANNOTATION_NOT_DISPLAYED}
            tab={t('components.annotationsForm.cards.annotations.tabs.layoutAnnotationNotDisplayed.title')}
            disabled={dsdDimensions === null && dsdAttributes === null}
          >
            <LayoutAnnotationNotDisplayed
              noCodes
              disabled={disabled}
              dsdDimensions={dsdDimensions}
              dsdAttributes={dsdAttributes}
              layoutAnnotations={layoutAnnotations}
              onChange={({layoutAnnotations: newLayoutAnnotations}) => {
                callOnChange(genericAnnotations, tabsMap, newLayoutAnnotations);
              }}
              annotationsConfig={annotationsConfig}
            />
          </Tabs.TabPane>
        );
      }
    }
  }

  return (
    <DataLanguageConsumer>
      {dataLanguage => {
        const language = dataLanguage || appLanguage;
        return (
          <Form>
            <Card
              type="inner"
              title={t('components.annotationsForm.cards.annotations.title')}
              style={{marginTop: MARGIN_MD}}
            >
              {genericOnly
                ? GenericAnnotationsTab
                : (
                  <Tabs>
                    {
                      (disabled && (!genericAnnotations || genericAnnotations.length === 0))
                        ? null
                        : (
                          <Tabs.TabPane
                            key={TAB_KEY_GENERAL}
                            tab={t('components.annotationsForm.cards.annotations.tabs.general.title')}
                          >
                            {GenericAnnotationsTab}
                          </Tabs.TabPane>
                        )
                    }
                    {username && annotationTabsConfig
                      .filter(({isVisible}) => isVisible)
                      .map(tab => {
                        const isTabEmpty = tabsMap[tab.name] === null ||
                          _(tabsMap[tab.name])
                            .pickBy(val => val !== null)
                            .keys()
                            .value().length < 1;
                        return (disabled && isTabEmpty)
                          ? null
                          : (
                            <Tabs.TabPane
                              key={tab.name}
                              tab={getLocalizedStr(tab.label, language, dataLanguages) || tab.name}>
                              <CustomAnnotationsForm
                                disabled={disabled}
                                config={annotationTabsConfig.find(({name}) => name === tab.name).annotations}
                                typesMap={tabsMap[tab.name].annotations}
                                onChange={({typesMap}) => {
                                  const newCustomAnnotationTabsMap = _.cloneDeep(tabsMap);
                                  newCustomAnnotationTabsMap[tab.name].annotations = typesMap;
                                  callOnChange(genericAnnotations, newCustomAnnotationTabsMap, layoutAnnotations);
                                }}
                              />
                            </Tabs.TabPane>
                          )
                      })
                    }
                    {variableTabs}
                  </Tabs>
                )
              }
            </Card>
          </Form>
        );
      }}
    </DataLanguageConsumer>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps)
)(AnnotationsForm);
