import React from 'react';
import {translate} from 'react-i18next';
import {MARGIN_SM} from '../../styles/constants';
import {Col, Icon, Row} from "antd";
import {PATH_BUILDER, PATH_DATAFLOW_BUILDER, PATH_FILE_MAPPING, PATH_LOADER,} from "../../constants/paths";

const BUILDER_PATH = PATH_BUILDER;
const FILE_MAPPING_PATH = PATH_FILE_MAPPING;
const LOADER_PATH = PATH_LOADER;
const DATAFLOW_BUILDER_PATH = PATH_DATAFLOW_BUILDER;

const titleStyle = {
  marginLeft: MARGIN_SM,
  fontSize: 20,
  color: 'red',
  fontWeight: 600,
  fontFamily: 'Fira Sans'
};

const pathStyle = {
  marginLeft: MARGIN_SM,
  marginRight: MARGIN_SM,
  fontSize: 18,
  fontWeight: 500,
  cursor: "pointer"
};

const titleIconStyle = {
  height: 18,
  position: 'relative',
  bottom: 4
};

const PageBreadcrumb = ({child, t}) =>
  <Row type="flex" align="middle" justify="space-between" style={{marginBottom: 0}}>
    <Col>
      <img alt={t(child.label)} src={child.blackIconPath} style={titleIconStyle}/>
      <span style={titleStyle}>{t(child.label)}</span>
    </Col>
    {(
      child.path === BUILDER_PATH ||
      child.path === FILE_MAPPING_PATH ||
      child.path === LOADER_PATH ||
      child.path === DATAFLOW_BUILDER_PATH
    ) && (
      <Col>
        <div style={{height: 30, paddingTop: 2}}>
          <span
            style={{...pathStyle, color: child.path === BUILDER_PATH ? "red" : ""}}
            onClick={() => window.open("./#" + BUILDER_PATH, '_self')}
          >
            {t('menu.builder.label')}
          </span>
          <Icon type="right"/>
          <span
            style={{...pathStyle, color: child.path === FILE_MAPPING_PATH ? "red" : ""}}
            onClick={() => window.open("./#" + FILE_MAPPING_PATH, '_self')}
          >
            {t('menu.fileMapping.label')}
          </span>
          <Icon type="right"/>
          <span
            style={{...pathStyle, color: child.path === LOADER_PATH ? "red" : ""}}
            onClick={() => window.open("./#" + LOADER_PATH, '_self')}
          >
            {t('menu.loader.label')}
          </span>
          <Icon type="right"/>
          <span
            style={{...pathStyle, color: child.path === DATAFLOW_BUILDER_PATH ? "red" : ""}}
            onClick={() => window.open("./#" + DATAFLOW_BUILDER_PATH, '_self')}
          >
            {t('menu.dataflowBuilder.label')}
          </span>
        </div>
      </Col>
    )}
  </Row>;

export default translate()(PageBreadcrumb);
