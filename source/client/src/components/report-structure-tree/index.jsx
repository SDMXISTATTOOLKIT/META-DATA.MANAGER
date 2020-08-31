import React, {Fragment} from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import EnhancedTree from "../enhanced-tree";
import {getNode, getNodes} from "../../utils/tree";
import {Button, Card, Checkbox, Col, Form, Icon, Input, Modal, Row, Switch, TimePicker, Upload} from "antd";
import {
  GUTTER_MD,
  GUTTER_SM,
  GUTTER_XS,
  MARGIN_MD,
  MARGIN_SM,
  MARGIN_XS,
  SPAN_FULL,
  SPAN_HALF
} from "../../styles/constants";
import "./style.css"
import _ from "lodash";
import LocalizedDatePicker from "../localized-date-picker";
import Selector from "../selector";
import DelayedHtmlEditor from "../delayed-html-editor";
import DelayedMultilanguageHtmlEditor from "../delayed-multilanguage-html-editor";
import DelayedZoomableTextArea from "../delayed-zoomable-textarea";
import DelayedMultilanguageZoomableTextArea from "../delayed-multilanguage-zoomable-textarea";
import AnnotationsForm from "../annotations-form";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import 'react-quill/dist/quill.snow.css';
import {
  ATTRIBUTE_TEXT_TYPE_BOOLEAN,
  ATTRIBUTE_TEXT_TYPE_DATE,
  ATTRIBUTE_TEXT_TYPE_DATETIME,
  ATTRIBUTE_TEXT_TYPE_DAY,
  ATTRIBUTE_TEXT_TYPE_FORMAT_DATE,
  ATTRIBUTE_TEXT_TYPE_FORMAT_DATETIME,
  ATTRIBUTE_TEXT_TYPE_FORMAT_TIME,
  ATTRIBUTE_TEXT_TYPE_GREGORIANDAY,
  ATTRIBUTE_TEXT_TYPE_GREGORIANYEAR,
  ATTRIBUTE_TEXT_TYPE_GREGORIANYEARMONTH,
  ATTRIBUTE_TEXT_TYPE_MONTH,
  ATTRIBUTE_TEXT_TYPE_MONTHDAY,
  ATTRIBUTE_TEXT_TYPE_STRING,
  ATTRIBUTE_TEXT_TYPE_TIME,
  ATTRIBUTE_TEXT_TYPE_XHTML,
  ATTRIBUTE_TEXT_TYPE_YEAR,
  ATTRIBUTE_TEXT_TYPE_YEARMONTH,
  getAttachmentAnnotationFromAnnotations,
  getAttributeType,
  isAttributeValueValid,
} from "../../utils/referenceMetadata";
import {BUTTON_CREATE, BUTTON_DELETE} from "../../styles/buttons";
import CustomEmpty from "../custom-empty";
import {withDataLanguage} from "../../contexts/DataLanguage";

const $ = window.jQuery;

const mapStateToProps = state => ({
  nodes: state.config.nodes,
  nodeId: state.app.endpointId,
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages,
});

const mapPropsToFields = ({selectedAttribute}) => ({
  texts: Form.createFormField({value: selectedAttribute ? selectedAttribute.texts : null}),
  attachmentName: Form.createFormField({value: selectedAttribute ? selectedAttribute.attachmentName : null}),
  isPublic: Form.createFormField({value: selectedAttribute ? selectedAttribute.isPublic : null})
});

const onFieldsChange = (props, fields) => props.onAttributeChange(_.mapValues(fields, ({value}) => value));

const getIsAddAttributeDisabled = selectedAttribute => {
  const maxOccurs = isNaN(selectedAttribute.maxOccurs)
    ? Number.MAX_VALUE
    : Number(selectedAttribute.maxOccurs);

  return selectedAttribute.metadataAttributes.length >= maxOccurs;
};

const getIsDeleteAttributeDisabled = (reportStructure, selectedAttribute) => {
  const parentAttribute = getNode(reportStructure, "metadataAttributes", node =>
    node.metadataAttributes.find(child => child.nodeKey === selectedAttribute.nodeKey));

  return (parentAttribute && parentAttribute.isFolder)
    ? parentAttribute.metadataAttributes.length <= Number(parentAttribute.minOccurs)
    : true;
};

const dcatDataflowDisabledFields = [
  "DCAT_AP_IT_DATASET_IDENTIFIER",
  "DCAT_AP_IT_DATASET_TITLE"
];

const getInputField = (form, selectedAttribute, attributeType, disabled, isDcatReport, isHtmlMode, onSelect, onReset, prefLang, dataLangs, t) => {
  const isDisabled = (disabled || (isDcatReport && dcatDataflowDisabledFields.includes(selectedAttribute.id)));

  if (selectedAttribute.id === "DCAT_AP_IT_DATASET_IDENTIFIER") {
    return (
      <Input
        key={selectedAttribute.nodeKey}
        title={form.getFieldValue("texts")}
        disabled={isDisabled}
      />
    )
  }

  if (selectedAttribute.localRepresentation.enumeration !== null) {
    return (
      <Selector
        key={selectedAttribute.nodeKey}
        selectTitle={t('components.reportStructureTree.selector.select.title')}
        resetTitle={t('components.reportStructureTree.selector.reset.title')}
        onSelect={onSelect}
        onReset={onReset}
        render={value => getLocalizedStr(value, prefLang, dataLangs)}
        disabled={isDisabled}
      />
    )

  } else {

    if (attributeType === ATTRIBUTE_TEXT_TYPE_DATETIME) {
      return (
        <LocalizedDatePicker
          key={selectedAttribute.nodeKey}
          format={ATTRIBUTE_TEXT_TYPE_FORMAT_DATETIME}
          showTime
          disabled={isDisabled}
        />
      )

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_GREGORIANDAY) {
      return (
        <LocalizedDatePicker
          key={selectedAttribute.nodeKey}
          format={ATTRIBUTE_TEXT_TYPE_FORMAT_DATE}
          disabled={isDisabled}
        />
      )

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_TIME) {
      return (
        <TimePicker
          key={selectedAttribute.nodeKey}
          format={ATTRIBUTE_TEXT_TYPE_FORMAT_TIME}
          style={{width: "100%"}}
          disabled={isDisabled}
        />
      )

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_BOOLEAN) {
      return <Checkbox key={selectedAttribute.nodeKey} disabled={isDisabled}/>

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_XHTML) {
      return selectedAttribute.isMultiLang
        ? <DelayedMultilanguageHtmlEditor key={selectedAttribute.nodeKey} disabled={isDisabled}/>
        : <DelayedHtmlEditor key={selectedAttribute.nodeKey} disabled={isDisabled}/>

    } else if (attributeType === ATTRIBUTE_TEXT_TYPE_STRING) {
      return selectedAttribute.isMultiLang
        ? isHtmlMode
          ? <DelayedMultilanguageHtmlEditor key={`${selectedAttribute.nodeKey}-html`} disabled={isDisabled}/>
          : <DelayedMultilanguageZoomableTextArea key={`${selectedAttribute.nodeKey}-string`} disabled={isDisabled}/>
        : isHtmlMode
          ? <DelayedHtmlEditor key={`${selectedAttribute.nodeKey}-html`} disabled={isDisabled}/>
          : <DelayedZoomableTextArea key={`${selectedAttribute.nodeKey}-string`} disabled={isDisabled}/>

    } else {
      return selectedAttribute.isMultiLang
        ? <DelayedMultilanguageZoomableTextArea key={selectedAttribute.nodeKey} disabled={isDisabled}/>
        : <DelayedZoomableTextArea key={selectedAttribute.nodeKey} disabled={isDisabled}/>
    }
  }
};

const getHelp = (attributeType, t) => {
  const helpPrefix = t('components.reportStructureTree.valueFormat.help') + ": ";

  switch (attributeType) {
    case ATTRIBUTE_TEXT_TYPE_DAY:
      return helpPrefix + "DD";
    case ATTRIBUTE_TEXT_TYPE_MONTH:
      return helpPrefix + "MM";
    case ATTRIBUTE_TEXT_TYPE_YEAR:
    case ATTRIBUTE_TEXT_TYPE_GREGORIANYEAR:
      return helpPrefix + "YYYY";
    case ATTRIBUTE_TEXT_TYPE_MONTHDAY:
      return helpPrefix + "MM-DD";
    case ATTRIBUTE_TEXT_TYPE_YEARMONTH:
    case ATTRIBUTE_TEXT_TYPE_GREGORIANYEARMONTH:
      return helpPrefix + "YYYY-MM";
    case ATTRIBUTE_TEXT_TYPE_DATE:
      return helpPrefix + "YYYY-MM-DD";
    default:
      return null;
  }
};

class ReportStructureTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isHtmlMode: true
    };
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (!prevProps.selectedAttribute && this.props.selectedAttribute) ||
      (prevProps.selectedAttribute && !this.props.selectedAttribute) ||
      (prevProps.selectedAttribute && this.props.selectedAttribute && prevProps.selectedAttribute.nodeKey !== this.props.selectedAttribute.nodeKey) ||
      (prevProps.dataLanguage !== this.props.dataLanguage)
    ) {

      if (this.props.selectedAttribute) {
        let isHtmlMode = true;

        const attributeType = getAttributeType(this.props.selectedAttribute).toLowerCase();
        if (attributeType === ATTRIBUTE_TEXT_TYPE_STRING || attributeType === ATTRIBUTE_TEXT_TYPE_XHTML) {
          const regExp = /(<\w*)((\s\/>)|(.*<\/\w*>))/gm;
          if (this.props.selectedAttribute.isMultiLang) {
            if (this.props.selectedAttribute.texts && this.props.selectedAttribute.texts[this.props.dataLanguage]) {
              isHtmlMode = regExp.test(this.props.selectedAttribute.texts[this.props.dataLanguage]);
            }
          } else {
            if (this.props.selectedAttribute.texts) {
              isHtmlMode = regExp.test(this.props.selectedAttribute.texts);
            }
          }
        }

        this.setState({
          isHtmlMode: isHtmlMode
        });

        $(".report-structure-tree__waring").css({color: "#FAAD14"})
      }
    }
  };

  render() {

    const {
      isHtmlMode
    } = this.state;

    const {
      t,
      form,
      dataLanguage,
      nodes,
      nodeId,
      appLang,
      dataLangs,
      reportStructure,
      selectedAttribute,
      disabled,
      onAttributeSelect,
      onAttributeCreate,
      onAttributeDelete,
      onCodesShow,
      onCodeUnset,
      onAttributeChange,
      isDcatReport,
      onFileUpload,
      onFileDownload
    } = this.props;

    const lang = (dataLanguage || appLang);

    const annotationsConfig = nodes.find(node => node.general.id === nodeId).annotations;
    const fileAttachedAnnot = selectedAttribute
      ? getAttachmentAnnotationFromAnnotations(selectedAttribute, annotationsConfig)
      : null;
    const fileAttachedName = fileAttachedAnnot ? fileAttachedAnnot.title : null;

    const attributeType = selectedAttribute ? getAttributeType(selectedAttribute).toLowerCase() : "";

    const isAttributeValid = isAttributeValueValid(selectedAttribute);

    return (
      <Row type="flex" gutter={GUTTER_MD}>
        <Col span={SPAN_HALF}>
          <div className={"report-structure-tree__tree"}>
            <EnhancedTree
              tree={reportStructure}
              getNodeKey={({nodeKey}) => nodeKey}
              childrenKey="metadataAttributes"
              idKey="id"
              nameKey="name"
              catIdKey="id"
              catNameKey="name"
              hiddenIdKeys={getNodes(reportStructure, "metadataAttributes", () => true).map(({nodeKey}) => nodeKey)}
              icon="file-text"
              getIconColor={() => "#37a0f4"}
              isEmptyCategoryIconLikeLeafIcon
              getFilter={
                searchText =>
                  ({id, name}) => {
                    const search = searchText.toLowerCase();
                    return (
                      (id && id.toLowerCase().indexOf(search) >= 0) ||
                      (name && getLocalizedStr(name, lang, dataLangs).toLowerCase().indexOf(search) >= 0)
                    );
                  }
              }
              externalControlledSelectedKeys
              selectedKeys={selectedAttribute ? [selectedAttribute.nodeKey] : []}
              onSelect={selectedArr => {
                if (!selectedAttribute) {
                  onAttributeSelect(selectedArr[0]);

                } else {
                  if (isAttributeValid) {
                    onAttributeSelect(selectedArr[0]);
                  } else {
                    $(".report-structure-tree__waring").css({color: "#FF0000"});
                  }
                }
              }}
              getIcon={(node, expanded) =>
                <Icon
                  theme="filled"
                  style={{color: node.isFolder ? "#f7c427" : "#37a0f4"}}
                  type={node.isFolder
                    ? (expanded && node.metadataAttributes && node.metadataAttributes.length > 0)
                      ? "folder-open"
                      : "folder"
                    : "file-text"
                  }
                />
              }
              searchBarSpan={SPAN_HALF}
              treeActions={[
                {
                  ...BUTTON_CREATE,
                  title: t("components.reportStructureTree.tree.actions.addAttribute.title"),
                  onClick: () => onAttributeCreate(),
                  disabled: (disabled || !selectedAttribute || !selectedAttribute.isFolder ||
                    getIsAddAttributeDisabled(selectedAttribute))
                },
                {
                  ...BUTTON_DELETE,
                  title: t("components.reportStructureTree.tree.actions.removeAttribute.title"),
                  onClick: () => onAttributeDelete(),
                  disabled: (disabled || !selectedAttribute || selectedAttribute.isFolder ||
                    getIsDeleteAttributeDisabled(reportStructure, selectedAttribute))
                }
              ]}
            />
          </div>
        </Col>
        <Col span={SPAN_HALF}>
          {selectedAttribute && !selectedAttribute.isFolder
            ? selectedAttribute.isPresentational
              ? <CustomEmpty text={t("components.reportStructureTree.isPresentational.placeholder")}/>
              : (
                <Card bodyStyle={{height: 480, overflow: "auto"}}>
                  <Form>
                    <Form.Item
                      label={
                        <Row type="flex" justify="start" gutter={GUTTER_XS} style={{height: 0, marginRight: 4}}>
                          {selectedAttribute.isMultiLang && (
                            <Col>
                              <Icon type="global" title={t("components.reportStructureTree.isMultilang.title")}/>
                            </Col>
                          )}
                          <Col>
                            {t('components.reportStructureTree.value.label')}
                          </Col>
                          {(attributeType && attributeType.length > 0) && (
                            <Col>
                              {`(${attributeType})`}
                            </Col>
                          )}
                        </Row>
                      }
                      help={getHelp(attributeType, t)}
                      style={{marginBottom: attributeType !== ATTRIBUTE_TEXT_TYPE_STRING ? 8 : 4}}
                    >
                      {form.getFieldDecorator("texts", {
                        valuePropName: attributeType === ATTRIBUTE_TEXT_TYPE_BOOLEAN
                          ? 'checked'
                          : "value"
                      })(
                        getInputField(form, selectedAttribute, attributeType, disabled, isDcatReport, isHtmlMode, onCodesShow, onCodeUnset, lang, dataLangs, t)
                      )}
                    </Form.Item>
                    {
                      selectedAttribute.localRepresentation.enumeration === null &&
                      attributeType === ATTRIBUTE_TEXT_TYPE_STRING &&
                      selectedAttribute.id !== "DCAT_AP_IT_DATASET_IDENTIFIER" && (
                        <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM} style={{marginBottom: 8}}>
                          <Col>
                            {t("components.reportStructureTree.htmlEditorModeSwitch.label") + ":"}
                          </Col>
                          <Col>
                            <Switch
                              checked={isHtmlMode}
                              onChange={() => this.setState({isHtmlMode: !isHtmlMode})}
                            />
                          </Col>
                        </Row>
                      )
                    }
                    <div className={"report-structure-tree__waring"}>
                      {!isAttributeValid && (
                        <Row type="flex" justify="start" align="middle" style={{marginBottom: 8}}>
                          <Col span={SPAN_FULL}>
                            {t("components.reportStructureTree.warning.notValidFormat.label")}
                          </Col>
                        </Row>
                      )}
                    </div>
                    {!isDcatReport && (
                      <Fragment>
                        <Form.Item
                          label={t('components.reportStructureTree.attachment.label')}
                          style={{marginBottom: MARGIN_XS}}
                        >
                          <Input
                            value={selectedAttribute.attachmentName}
                            disabled={disabled}
                            addonAfter={disabled
                              ? null
                              : (
                                <Upload
                                  customRequest={({file}) => {
                                    if (!file || file.size < 2147483648) { // 2147483648 bytes = 2 GB
                                      onAttributeChange({
                                        attachment: file,
                                        attachmentName: (file && file.name) ? file.name : null
                                      })
                                    } else {
                                      Modal.warning({
                                        title: t('components.fileInput.modals.warning.fileTooBig.title'),
                                        content: file.type !== "application/x-zip-compressed"
                                          ? t('components.fileInput.modals.warning.fileTooBig.zipIt.content')
                                          : t('components.fileInput.modals.warning.fileTooBig.content')
                                      });
                                    }
                                  }}
                                  style={{cursor: "pointer", width: "100%", height: "100%"}}
                                  showUploadList={false}
                                  disabled={selectedAttribute.attachmentName !== null}
                                >
                                  {selectedAttribute.attachmentName !== null
                                    ? (
                                      <Icon
                                        onClick={e => {
                                          if (!disabled) {
                                            e.stopPropagation();
                                            onAttributeChange({
                                              attachment: null,
                                              attachmentName: null,
                                              attachmentUploaded: false
                                            });
                                          }
                                        }}
                                        type="close"
                                        style={{cursor: !disabled ? "pointer" : "not-allowed"}}
                                      />
                                    )
                                    : (
                                      <Icon
                                        type="paper-clip"
                                        style={{cursor: !disabled ? "pointer" : "not-allowed"}}
                                      />
                                    )
                                  }
                                </Upload>
                              )
                            }
                          />
                        </Form.Item>
                        <Row type="flex" justify="end" style={{marginTop: MARGIN_XS}}>
                          <Col>
                            {!disabled && (
                              <Fragment>
                                <div
                                  style={{
                                    color: 'rgba(0, 0, 0, 0.85)',
                                    marginRight: MARGIN_SM,
                                    display: "inline-block",
                                    verticalAlign: "middle"
                                  }}
                                >
                                  {t("components.reportStructureTree.attachmentUploaded.label") + ' :'}
                                </div>
                                <Icon
                                  theme="filled"
                                  type={(selectedAttribute.attachmentUploaded) ? 'check-circle' : 'close-circle'}
                                  style={{
                                    color: selectedAttribute.attachmentUploaded ? 'green' : 'red',
                                    marginRight: MARGIN_MD,
                                    display: "inline-block",
                                    verticalAlign: "middle"
                                  }}
                                />
                                <Button
                                  type="primary"
                                  title={t("commons.buttons.upload.title")}
                                  onClick={() => onFileUpload(selectedAttribute.attachment)}
                                  disabled={!selectedAttribute.attachment}
                                  style={{
                                    marginRight: MARGIN_SM,
                                    display: "inline-block",
                                    verticalAlign: "middle"
                                  }}
                                >
                                  {t("commons.buttons.upload.title")}
                                </Button>
                              </Fragment>
                            )}
                            <Button
                              type="primary"
                              title={t("commons.buttons.download.title")}
                              onClick={() => onFileDownload(fileAttachedName)}
                              disabled={!selectedAttribute.attachmentUploaded}
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle"
                              }}
                            >
                              {t("commons.buttons.download.title")}
                            </Button>
                          </Col>
                        </Row>
                        <Row
                          type="flex"
                          justify="start"
                          align="middle"
                          gutter={GUTTER_MD}
                          style={{marginTop: MARGIN_SM}}
                        >
                          <Col style={{color: 'rgba(0, 0, 0, 0.85)'}}>
                            {t("components.reportStructureTree.isPublic.label") + ' :'}
                          </Col>
                          <Col>
                            <Form.Item>
                              {form.getFieldDecorator("isPublic", {valuePropName: 'checked'})(<Checkbox
                                disabled={disabled}/>)}
                            </Form.Item>
                          </Col>
                        </Row>
                      </Fragment>
                    )}
                  </Form>
                  {!isDcatReport && (
                    <AnnotationsForm
                      annotations={selectedAttribute ? selectedAttribute.annotations : null}
                      onChange={onAttributeChange}
                      genericOnly
                      isGenericOneLinePerField
                      disabled={disabled}
                    />
                  )}
                </Card>
              )
            : null
          }
        </Col>
      </Row>
    )
  };
}

export default compose(
  translate(),
  connect(mapStateToProps),
  withDataLanguage(),
  Form.create({mapPropsToFields, onFieldsChange})
)(ReportStructureTree);
