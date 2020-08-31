import React, {Fragment} from "react";
import {MARGIN_MD, MODAL_WIDTH_LG, SPAN_ONE_QUARTER, SPAN_THREE_QUARTERS} from "../../styles/constants";
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Button, Col, Divider, Row, Tabs} from "antd";
import EnhancedModal from "../../components/enhanced-modal";
import {connect} from "react-redux";
import {getCustomAnnotationsTabsMap} from "../../utils/annotations";
import CustomEmpty from "../custom-empty";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import CollapsibleText from "../collapsible-text";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const CustomAnnotationList = ({
                                t,
                                endpoints,
                                endpointId,
                                appLanguage,
                                dataLanguages,
                                annotations,
                                title,
                                onClose
                              }) => {
  const config = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs;
  const typesMap = getCustomAnnotationsTabsMap(annotations, config.tabs);
  return (
    <EnhancedModal
      visible={annotations != null}
      onCancel={onClose}
      footer={<Button onClick={onClose}>{t('commons.buttons.close.title')}</Button>}
      width={MODAL_WIDTH_LG}
      title={title || ''}
      withDataLanguageSelector
    >
      {config.tabs.filter(({isVisible}) => isVisible).length > 0
        ? (
          <DataLanguageConsumer>
            {dataLanguage => {
              const language = dataLanguage || appLanguage;
              return (
                <Tabs>
                  {config.tabs
                    .filter(({isVisible}) => isVisible)
                    .map(tab => {
                      let annotations = tab.annotations.filter(annot => annot.isVisible && typesMap[tab.name].annotations[annot.name]);
                      return annotations.length > 0
                        ? (
                          <Tabs.TabPane
                            key={tab.name}
                            tab={getLocalizedStr(typesMap[tab.name].label, language, dataLanguages) || tab.name}
                          >
                            {
                              annotations
                                .map((annot, key) =>
                                  <Fragment key={key}>
                                    <Row>
                                      <Col span={SPAN_ONE_QUARTER}>
                                        <b>{getLocalizedStr(annot.label, language, dataLanguages) || annot.name}</b>
                                      </Col>
                                      <Col span={SPAN_THREE_QUARTERS}>
                                        <CollapsibleText isCollapsedDefault={config.isTextCollapsed}>
                                          {getLocalizedStr(typesMap[tab.name].annotations[annot.name], language, dataLanguages)}
                                        </CollapsibleText>
                                      </Col>
                                    </Row>
                                    {key < annotations.length - 1 && (
                                      <Divider style={{marginTop: MARGIN_MD, marginBottom: MARGIN_MD}}/>
                                    )}
                                  </Fragment>
                                )
                            }
                          </Tabs.TabPane>
                        )
                        : null
                    })
                  }
                </Tabs>
              );
            }}
          </DataLanguageConsumer>
        )
        : <CustomEmpty/>
      }
    </EnhancedModal>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps)
)(CustomAnnotationList);
