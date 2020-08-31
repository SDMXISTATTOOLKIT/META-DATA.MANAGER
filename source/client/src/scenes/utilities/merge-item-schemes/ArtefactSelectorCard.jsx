import React from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import {Button, Card, Checkbox, Form, Input, Radio, Row, Select} from "antd";
import Selector from "../../../components/selector";
import FileInput from "../../../components/file-input";
import {MARGIN_MD, SPAN_HALF} from "../../../styles/constants";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../../utils/languages";
import _ from "lodash";
import {connect} from "react-redux";
import {
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV,
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB,
  MERGE_ITEM_SCHEMES_FORMAT_TYPE_SDMX,
  showMergeItemSchemesCsvPreview,
  showMergeItemSchemesXmlPreview
} from "./actions";

const mapStateToProps = state => ({
  appLang: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  artefactType: state.scenes.utilities.mergeItemSchemes.artefactType
});

const mapPropsToFields = ({csvProps}) => ({
  lang: Form.createFormField({value: csvProps ? csvProps.lang : null}),
  textSeparator: Form.createFormField({value: csvProps ? csvProps.textSeparator : null}),
  textDelimiter: Form.createFormField({value: csvProps ? csvProps.textDelimiter : null}),
  firstRowHeader: Form.createFormField({value: csvProps ? csvProps.firstRowHeader : null}),
});

const mapDispatchToProps = dispatch => ({
  onXmlPreviewShow: isSource => dispatch(showMergeItemSchemesXmlPreview(isSource)),
  onCsvPreviewShow: isSource => dispatch(showMergeItemSchemesCsvPreview(isSource))
});

const onFieldsChange = (props, fields) =>
  props.onCsvPropsChange(_.mapValues(fields, ({value}) => value));

const formItemLayout = {
  labelCol: {span: SPAN_HALF},
  wrapperCol: {span: SPAN_HALF}
};

const ArtefactSelectorCard = ({
                                t,
                                form,
                                dataLanguages,
                                title,
                                format,
                                onFormatChange,
                                artefact,
                                isSource,
                                onFileSet,
                                onArtefactDetailShow,
                                onArtefactsShow,
                                onArtefactUnset,
                                onXmlPreviewShow,
                                onCsvPreviewShow
                              }) =>
  <Card
    title={title}
    type="inner"
  >
    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
      <Radio.Group
        value={format}
        onChange={({target}) => onFormatChange(target.value)}
      >
        <Radio.Button value={MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB}>
          MSDB
        </Radio.Button>
        <Radio.Button value={MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV}>
          CSV
        </Radio.Button>
        <Radio.Button value={MERGE_ITEM_SCHEMES_FORMAT_TYPE_SDMX}>
          SDMX-ML
        </Radio.Button>
      </Radio.Group>
    </Row>
    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
      {
        format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_MSDB
          ? (
            <Selector
              value={artefact && `${artefact.id}+${artefact.agencyID}+${artefact.version}`}
              detailTitle={t('scenes.utilities.mergeItemSchemes.artefactSelectorCard.selector.detail.title')}
              selectTitle={t('scenes.utilities.mergeItemSchemes.artefactSelectorCard.selector.select.title')}
              resetTitle={t('scenes.utilities.mergeItemSchemes.artefactSelectorCard.selector.reset.title')}
              onDetail={onArtefactDetailShow}
              onSelect={onArtefactsShow}
              onReset={onArtefactUnset}
            />
          )
          : (
            <div style={{width: "100%"}}>
              <div style={{width: 120, marginRight: 8, display: "inline-block", verticalAlign: "middle"}}>
                <Button
                  type="primary"
                  style={{width: "100%"}}
                  onClick={() => format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV
                    ? onCsvPreviewShow(isSource)
                    : onXmlPreviewShow(isSource)
                  }
                  disabled={!artefact}
                >
                  {t('commons.buttons.preview.title')}
                </Button>
              </div>
              <div style={{width: "calc(100% - 128px)", display: "inline-block", verticalAlign: "middle"}}>
                <FileInput
                  value={artefact}
                  onChange={onFileSet}
                  accept={format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV
                    ? ".csv"
                    : ".xml"
                  }
                />
              </div>
            </div>
          )
      }
    </Row>
    {
      format === MERGE_ITEM_SCHEMES_FORMAT_TYPE_CSV && (
        <Form>
          <Form.Item
            className="form-item-required"
            label={t('data.commons.language.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('lang')(
              <Select
                showSearch
                filterOption={(inputValue, {props}) =>
                  props.title.toLowerCase().includes(inputValue.toLowerCase())
                }
                style={{width: 160}}
              >
                {dataLanguages.map(
                  ({code}) =>
                    <Select.Option
                      key={code}
                      value={code}
                      title={getLanguageLabel(t, code)}
                    >
                      <i
                        className={`flag-icon ${getLanguageFlagIconCss(code, dataLanguages)}`}
                        style={{marginRight: 8}}
                      />
                      {getLanguageLabel(t, code)}
                    </Select.Option>
                )}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={t('data.csv.hasHeader.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('firstRowHeader', {valuePropName: 'checked'})(<Checkbox/>)}
          </Form.Item>
          <Form.Item
            className="form-item-required"
            label={t('data.csv.separator.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('textSeparator')(<Input maxLength={1} style={{width: 48}}/>)}
          </Form.Item>
          <Form.Item
            label={t('data.csv.delimiter.label')}
            {...formItemLayout}
          >
            {form.getFieldDecorator('textDelimiter')(<Input maxLength={1} style={{width: 48}}/>)}
          </Form.Item>
        </Form>
      )
    }
  </Card>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ArtefactSelectorCard);