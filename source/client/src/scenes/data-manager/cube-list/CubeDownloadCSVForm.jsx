import {Button, Checkbox, Col, Form, Input, Row} from "antd";
import {GUTTER_MD, MARGIN_LG, MARGIN_MD, MARGIN_SM, SPAN_FULL, SPAN_HALF} from "../../../styles/constants";
import React from "react";

const formItemLayout = {
  labelCol: {span: SPAN_HALF},
  wrapperCol: {span: SPAN_HALF}
};

const CubeDownloadCSVForm = (
  ({form, t, modal, onDownload}) =>
    <Form className="advanced-form">
      <Row style={{marginTop: MARGIN_MD}}>
        <Col span={SPAN_FULL}>
          <Form.Item
            className="form-item-required"
            label={t('data.csv.separator.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('separator', {initialValue: ";"})(
              <Input maxLength={1} style={{width: 96}}/>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row style={{marginTop: MARGIN_SM}}>
        <Col span={SPAN_FULL}>
          <Form.Item
            label={t('data.csv.delimiter.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('delimiter')(
              <Input maxLength={1} style={{width: 96}}/>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row style={{marginTop: MARGIN_MD}}>
        <Col span={SPAN_FULL}>
          <Form.Item
            label={t('components.artefactDownloadForm.compression.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('compression', {valuePropName: 'checked'})(
              <Checkbox
                title={form.getFieldValue('compression')}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row type="flex" style={{marginTop: MARGIN_LG}} justify="end" gutter={GUTTER_MD}>
        <Col>
          <Button onClick={() => modal.destroy()}>
            {t("scenes.dataManager.cubeList.modals.cubeDownload.csvForm.buttons.cancel.title")}
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            disabled={!form.getFieldValue('separator') || form.getFieldValue('separator').length === 0}
            onClick={
              () => {
                modal.destroy();
                onDownload(form.getFieldValue('separator'), form.getFieldValue('delimiter'), form.getFieldValue('compression'))
              }
            }
          >
            {t("scenes.dataManager.cubeList.modals.cubeDownload.csvForm.buttons.download.title")}
          </Button>
        </Col>
      </Row>
    </Form>
);

export default Form.create()(CubeDownloadCSVForm);
