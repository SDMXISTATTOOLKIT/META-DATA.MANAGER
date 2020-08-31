import React, {Fragment} from "react";
import {Button, Col, Modal, Row} from "antd";
import {compose} from "redux";
import {translate} from "react-i18next";
import EnhancedModal from "../enhanced-modal";
import {MODAL_WIDTH_MD, TABLE_COL_MIN_WIDTH_ID} from "../../styles/constants";
import {
  DSD_COMPONENT_TYPE_ATTRIBUTE,
  DSD_COMPONENT_TYPE_DIMENSION
} from "../../redux-components/redux-dsd-detail-modal/dsd-detail/ComponentForm";
import {getLayoutAnnotationNotDisplayed, setLayoutAnnotationNotDisplayed} from "../../utils/annotations";
import _ from "lodash";
import InfiniteScrollTable from "../infinite-scroll-table";
import {BUTTON_DELETE, BUTTON_DETAIL} from "../../styles/buttons";
import {
  getArtefactTripletFromString,
  getArtefactTripletFromUrn,
  getStringFromArtefactTriplet
} from "../../utils/sdmxJson";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {connect} from "react-redux";
import ItemList from "../item-list";

const mapStateToProps = state => ({
  appLanguage: state.app.language
});

class NotDisplayed extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isEditTableVisible: false,
      tempEditTableChecked: null,
      codesEditTableId: null,
      tempCodesEditTableChecked: null,
      codelistTriplet: null
    };

    this.onEditTableShow = this.onEditTableShow.bind(this);
    this.onEditTableHide = this.onEditTableHide.bind(this);
    this.onEditTableChange = this.onEditTableChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onCodesEditTableShow = this.onCodesEditTableShow.bind(this);
    this.onCodesEditTableHide = this.onCodesEditTableHide.bind(this);
    this.onCodesEditTableChange = this.onCodesEditTableChange.bind(this);
  }

  onEditTableShow() {

    this.setState({
      isEditTableVisible: true,
      tempEditTableChecked: Object.keys(getLayoutAnnotationNotDisplayed(this.props.layoutAnnotations, this.props.annotationsConfig))
    });
  }

  onEditTableHide() {
    this.setState({
      isEditTableVisible: false,
      tempEditTableChecked: null
    });
  }

  onSubmit() {

    const notDisplayed = {};

    const oldNotDisplayed = getLayoutAnnotationNotDisplayed(this.props.layoutAnnotations, this.props.annotationsConfig);

    (this.state.tempEditTableChecked || Object.keys(oldNotDisplayed)).forEach(id =>
      notDisplayed[id] =
        (this.state.tempCodesEditTableChecked && this.state.tempCodesEditTableChecked[id])
        || oldNotDisplayed[id]
        || []
    );

    this.props.onChange({
      layoutAnnotations: setLayoutAnnotationNotDisplayed(_.cloneDeep(this.props.layoutAnnotations), this.props.annotationsConfig, notDisplayed)
    });
    this.onEditTableHide();
    this.onCodesEditTableHide();
  }

  onEditTableChange(checkedArr) {
    this.setState({
      tempEditTableChecked: checkedArr
    });
  }

  onCodesEditTableShow(id, codelistTriplet) {

    this.setState({
      codesEditTableId: id,
      codelistTriplet,
      tempCodesEditTableChecked: getLayoutAnnotationNotDisplayed(this.props.layoutAnnotations, this.props.annotationsConfig)[id] || []
    });
  }

  onCodesEditTableHide() {
    this.setState({
      codesEditTableId: null,
      codelistTriplet: null,
      tempCodesEditTableChecked: null
    });
    if (!this.props.noCodes) {
      this.props.resetItemsPage();
    }
  }

  onCodesEditTableChange(checkedArr) {

    const tempCodesEditTableChecked = this.state.tempCodesEditTableChecked || {};

    tempCodesEditTableChecked[this.state.codesEditTableId] = checkedArr;

    this.setState({
      tempCodesEditTableChecked
    });
  }

  onDeleteComponent(id) {

    const notDisplayed = {};

    const oldNotDisplayed = getLayoutAnnotationNotDisplayed(this.props.layoutAnnotations, this.props.annotationsConfig);

    Object.keys(oldNotDisplayed).forEach(el => {
      if (id !== el) {
        notDisplayed[el] = oldNotDisplayed[el];
      }
    });

    this.props.onChange({
      layoutAnnotations: setLayoutAnnotationNotDisplayed(_.cloneDeep(this.props.layoutAnnotations), this.props.annotationsConfig, notDisplayed)
    });
    this.onEditTableHide();
    this.onCodesEditTableHide();
  }

  render() {
    const {
      t,
      disabled,
      noCodes,
      dsdDimensions,
      dsdAttributes,
      layoutAnnotations,
      annotationsConfig,
      appLanguage,
      itemCount,
      itemsPage,
      fetchItemsPage,
    } = this.props;

    const {
      isEditTableVisible,
      tempEditTableChecked,
      tempCodesEditTableChecked,
      codesEditTableId,
      codelistTriplet
    } = this.state;

    const notDisplayed = getLayoutAnnotationNotDisplayed(layoutAnnotations, annotationsConfig);

    const dsdComponents =
      (dsdDimensions || [])
        .map(({id, localRepresentation}) => ({
          id,
          type: DSD_COMPONENT_TYPE_DIMENSION,
          codelistTriplet: (
            localRepresentation && localRepresentation.enumeration &&
            getStringFromArtefactTriplet(getArtefactTripletFromUrn(localRepresentation.enumeration))
          ) || null,
          codes: notDisplayed[id] || []
        }))
        .sort((a, b) =>
          a.order && b.order && a.order !== b.order
            ? a.order - b.order
            : a.id - b.id
        ).concat(
        (dsdAttributes || [])
          .map(({id, localRepresentation}) => ({
            id,
            type: DSD_COMPONENT_TYPE_ATTRIBUTE,
            codelistTriplet: (
                localRepresentation && localRepresentation.enumeration &&
                getStringFromArtefactTriplet(getArtefactTripletFromUrn(localRepresentation.enumeration))
              )
              || null,
            codes: notDisplayed[id] || []
          }))
          .sort((a, b) =>
            a.order && b.order && a.order !== b.order
              ? a.order - b.order
              : a.id - b.id
          )
      );

    const columns = [
      {
        title: t('data.dsd.component.id.shortLabel'),
        dataIndex: 'id',
        minWidth: TABLE_COL_MIN_WIDTH_ID
      },
      {
        title: t('data.dsd.component.type.shortLabel'),
        dataIndex: 'type',
        minWidth: TABLE_COL_MIN_WIDTH_ID,
        withValuesFilter: true,
        render: type => type === DSD_COMPONENT_TYPE_DIMENSION
          ? t('data.dsd.component.type.values.dimension')
          : t('data.dsd.component.type.values.attribute'),
        renderText: type => type === DSD_COMPONENT_TYPE_DIMENSION
          ? t('data.dsd.component.type.values.dimension')
          : t('data.dsd.component.type.values.attribute')
      }
    ].concat(!noCodes ? {
      title: t('components.notDisplayed.dsdComponentsTable.columns.codes.title'),
      dataIndex: 'codes',
      render: codes => codes.join("+"),
      renderText: codes => codes.join("+")
    } : []);


    const _this = this;

    return (
      <Fragment>
        <InfiniteScrollTable
          data={
            dsdComponents
              .filter(({id}) => Object.keys(notDisplayed).includes(id))
          }
          getRowKey={({id}) => id}
          columns={columns}
          actions={[
            ({id, codelistTriplet}) => (!noCodes)
              ? ({
                ...BUTTON_DETAIL,
                title: codelistTriplet !== null ?
                  t('components.notDisplayed.dsdComponentsTable.actions.detail.title') :
                  t('components.notDisplayed.dsdComponentsTable.actions.detailNoCodelist.title'),
                onClick: () => this.onCodesEditTableShow(id, codelistTriplet),
                disabled: codelistTriplet === null
              })
              : null,
            ({id}) => ({
              ...BUTTON_DELETE,
              title: t('components.notDisplayed.dsdComponentsTable.actions.delete.title'),
              onClick: () => {
                Modal.confirm({
                  title: t('components.notDisplayed.dsdComponentsTable.confirms.delete.title'),
                  content: notDisplayed[id] && notDisplayed[id].length
                    ? t('components.notDisplayed.dsdComponentsTable.confirms.delete.content')
                    : undefined,
                  onOk() {
                    _this.onDeleteComponent(id);
                  },
                  cancelText: t('commons.buttons.cancel.title')
                })
              }
            })
          ]}
          rightActions={
            !disabled && (
              <Row type="flex" justify="end">
                <Col>
                  <Button type="primary" onClick={this.onEditTableShow}>
                    {t("components.annotationsForm.layoutAnnotationNotDisplayed.editButton.title")}
                  </Button>
                  <EnhancedModal
                    visible={isEditTableVisible}
                    width={MODAL_WIDTH_MD}
                    title={t("components.annotationsForm.layoutAnnotationNotDisplayed.editTable.title")}
                    onCancel={this.onEditTableHide}
                    footer={
                      <div>
                        <Button onClick={this.onEditTableHide}>
                          {t('commons.buttons.close.title')}
                        </Button>
                        <Button
                          onClick={this.onSubmit}
                          type="primary"
                        >
                          {t('commons.buttons.save.title')}
                        </Button>
                      </div>
                    }
                  >
                    <InfiniteScrollTable
                      data={dsdComponents}
                      getRowKey={({id}) => id}
                      columns={columns}
                      rowSelection={{
                        selectedRowKeys: tempEditTableChecked || [],
                        onChange: this.onEditTableChange
                      }}
                    />
                  </EnhancedModal>
                </Col>
              </Row>
            )
          }
        />
        <EnhancedModal
          visible={codesEditTableId !== null}
          width={MODAL_WIDTH_MD}
          title={t("components.annotationsForm.layoutAnnotationNotDisplayed.codesEditTable.title", {componentId: codesEditTableId})}
          onCancel={this.onCodesEditTableHide}
          footer={
            <div>
              <Button onClick={this.onCodesEditTableHide}>
                {t('commons.buttons.close.title')}
              </Button>
              <Button
                onClick={this.onSubmit}
                type="primary"
              >
                {t('commons.buttons.save.title')}
              </Button>
            </div>
          }
          withDataLanguageSelector
        >
          <DataLanguageConsumer>
            {dataLanguage => {
              const language = dataLanguage || appLanguage;
              return (
                <ItemList
                  data={itemsPage || null}
                  rowCount={itemCount}
                  isPaginated
                  onChange={
                    ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
                      fetchItemsPage({
                        codelistTriplet: getArtefactTripletFromString(codelistTriplet),
                        language,
                        pageNum,
                        pageSize,
                        searchText,
                        filters,
                        sortCol,
                        sortByDesc
                      })
                  }
                  rowSelection={{
                    selectedRowKeys: (tempCodesEditTableChecked || []),
                    onChange: this.onCodesEditTableChange
                  }}
                />
              );
            }}
          </DataLanguageConsumer>
        </EnhancedModal>
      </Fragment>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(NotDisplayed);
