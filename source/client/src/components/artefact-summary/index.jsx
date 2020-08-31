import React from 'react';
import {translate} from 'react-i18next';
import {Card, Col, Form, Input, Row} from 'antd';
import {GUTTER_MD, SPAN_ONE_THIRD, SPAN_TWO_THIRDS} from '../../styles/constants';

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const ArtefactSummary = ({t, id, agencyID, version}) =>
  <Card type="inner">
    <Form className="advanced-form">
      <Row gutter={GUTTER_MD}>
        <Col span={SPAN_ONE_THIRD}>
          <Form.Item
            label={t('data.artefact.id.label')}
            {...formItemLayout}
          >
            <Input value={id} disabled/>
          </Form.Item>
        </Col>
        <Col span={SPAN_ONE_THIRD}>
          <Form.Item
            label={t('data.artefact.agencyID.label')}
            {...formItemLayout}
          >
            <Input value={agencyID} disabled/>
          </Form.Item>
        </Col>
        <Col span={SPAN_ONE_THIRD}>
          <Form.Item
            label={t('data.artefact.version.label')}
            {...formItemLayout}
          >
            <Input value={version} disabled/>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </Card>;


export default translate()(ArtefactSummary);
