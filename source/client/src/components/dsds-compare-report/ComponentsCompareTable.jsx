import React, {Fragment} from 'react';
import {Col, Icon, Row} from "antd";
import {GUTTER_SM} from "../../styles/constants";

const SPAN_COMPONENT_COL = 11;
const SPAN_CENTER_COL = 2;

const IconFontCNIcons = Icon.createFromIconfontCN({
  scriptUrl: './static/vendor/iconfont_cn/iconfont.js',
});

const differenceIconStyle = {
  type: 'circle',
  style: {
    color: 'red',
    transform: 'scale(1.3)'
  }
};

const mandatoryIconStyle = {
  type: 'm',
  style: {
    transform: 'scale(1.1)'
  },
  title: "Mandatory"
};

const ComponentsCompareTable = ({
                                  sourceComponents,
                                  targetComponents
                                }) =>
  <Fragment>
    {sourceComponents && sourceComponents.map((component, idx) =>
      <Fragment key={idx}>
        <Row type="flex" align="middle" style={{marginTop: 0, marginBottom: 0}} key={idx}>
          <Col span={SPAN_COMPONENT_COL}>
            <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
              <Col>
                {component.key}
              </Col>
              <Col>
                {component.mandatory ? <IconFontCNIcons {...mandatoryIconStyle}/> : null}
              </Col>
            </Row>
          </Col>
          <Col span={SPAN_CENTER_COL}>
            <Row type="flex" justify="center">
              <IconFontCNIcons {...differenceIconStyle}/>
            </Row>
          </Col>
          <Col span={SPAN_COMPONENT_COL}/>
        </Row>
        {!(idx === (sourceComponents.length - 1) && targetComponents.length === 0) && (
          <Row type="flex">
            <Col span={SPAN_COMPONENT_COL}/>
            <Col span={SPAN_CENTER_COL}>
              <Row type="flex" justify="center">
                |
              </Row>
            </Col>
            <Col span={SPAN_COMPONENT_COL}/>
          </Row>
        )}
      </Fragment>
    )}
    {targetComponents && targetComponents.map((component, idx) =>
      <Fragment key={idx}>
        <Row type="flex" align="middle" style={{marginTop: 0, marginBottom: 0}} key={idx}>
          <Col span={SPAN_COMPONENT_COL}/>
          <Col span={SPAN_CENTER_COL}>
            <Row type="flex" justify="center">
              <IconFontCNIcons {...differenceIconStyle}/>
            </Row>
          </Col>
          <Col span={SPAN_COMPONENT_COL}>
            <Row type="flex" justify="start" align="middle" gutter={GUTTER_SM}>
              <Col>
                {component.key}
              </Col>
              <Col>
                {component.mandatory ? <IconFontCNIcons {...mandatoryIconStyle}/> : null}
              </Col>
            </Row>
          </Col>
        </Row>
        {(idx !== targetComponents.length - 1) && (
          <Row type="flex">
            <Col span={SPAN_COMPONENT_COL}/>
            <Col span={SPAN_CENTER_COL}>
              <Row type="flex" justify="center">
                |
              </Row>
            </Col>
            <Col span={SPAN_COMPONENT_COL}/>
          </Row>
        )}
      </Fragment>
    )}
  </Fragment>;

export default (ComponentsCompareTable);