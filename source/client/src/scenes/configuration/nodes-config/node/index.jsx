import React from 'react';
import {translate} from 'react-i18next';
import {Tabs} from "antd";
import GeneralForm from "./GeneralForm";
import AgenciesForm from "./AgenciesForm";
import EndpointForm from "./EndpointForm";
import AnnotationTabsForm from "./custom-annotations/CustomAnnotationsForm";
import ProxyForm from "./ProxyForm";
import SearchForm from "./SearchForm";
import OrderForm from "./AnnotationsForm";
import DcatApItForm from "./DcatApItForm";

const Node = ({
                t,
                node,
                index,
                onChange
              }) =>
  <Tabs tabPosition="left">
    <Tabs.TabPane key="general" tab={t('scenes.configuration.nodesConfig.tabs.general.title')}>
      <GeneralForm General={node.General} onChange={fields => onChange({General: fields})} disableID={!node.isNewNode}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="agencies" tab={t('scenes.configuration.nodesConfig.tabs.agencies.title')}>
      <AgenciesForm Agencies={node.Agencies} onChange={fields => onChange({Agencies: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="endpoint" tab={t('scenes.configuration.nodesConfig.tabs.endpoint.title')}>
      <EndpointForm node={node} nodeIndex={index} onChange={fields => onChange({Endpoint: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="customAnnotations" tab={t('scenes.configuration.nodesConfig.tabs.customAnnotations.title')}>
      <AnnotationTabsForm AnnotationTabs={node.AnnotationTabs} onChange={fields => onChange({AnnotationTabs: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="annotations" tab={t('scenes.configuration.nodesConfig.tabs.annotations.title')}>
      <OrderForm Annotations={node.Annotations} onChange={fields => onChange({Annotations: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="proxy" tab={t('scenes.configuration.nodesConfig.tabs.proxy.title')}>
      <ProxyForm Proxy={node.Proxy} onChange={fields => onChange({Proxy: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="search" tab={t('scenes.configuration.nodesConfig.tabs.search.title')}>
      <SearchForm Search={node.Search} onChange={fields => onChange({Search: fields})}/>
    </Tabs.TabPane>
    <Tabs.TabPane key="dcatApIt" tab={t('scenes.configuration.nodesConfig.tabs.dcatApIt.title')}>
      <DcatApItForm
        DcatApIt={node.DcatApIt}
        onChange={fields => onChange({DcatApIt: fields})}
        nodeIndex={index}
      />
    </Tabs.TabPane>
  </Tabs>;

export default translate()(Node);

