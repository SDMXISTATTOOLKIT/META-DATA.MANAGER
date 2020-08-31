import React, {Fragment} from "react";
import {compose} from "redux";
import {translate} from "react-i18next";
import {
  getLayoutAnnotationDefaultTableLayout,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATABROWSER,
  LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER,
  setLayoutAnnotationDefaultTableLayout
} from "../../utils/annotations";
import {Card, Checkbox, Col, Modal, Radio, Row, Tag} from "antd";
import _ from "lodash";
import {GUTTER_MD, GUTTER_SM, MARGIN_MD, MARGIN_SM, PADDING_MD, SPAN_FULL, SPAN_HALF} from "../../styles/constants";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import DragHandle from "../drag-handle";
import CustomEmpty from "../custom-empty";
import {getHtmlTableString} from "./htmlTable";
import "./style.css";

export const DROPPABLE_ID_ROW = 'DROPPABLE_ID_ROW';
export const DROPPABLE_ID_COLUMN = 'DROPPABLE_ID_COLUMN';
export const DROPPABLE_ID_FILTER = 'DROPPABLE_ID_FILTER';
export const DROPPABLE_ID_ROW_SECTION = 'DROPPABLE_ID_ROW_SECTION';

class DefaultTableLayout extends React.Component {

  constructor(props) {
    super(props);

    const layoutAnnotationDefaultTableLayout = getLayoutAnnotationDefaultTableLayout(this.props.layoutAnnotations, this.props.annotationsConfig);

    const {
      row,
      column,
      rowSection,
      filter
    } = layoutAnnotationDefaultTableLayout || this.getDefaultLayout();

    const mode = !layoutAnnotationDefaultTableLayout || filter.length > 0
      ? LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATABROWSER
      : LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER;

    this.state = {
      flagSaveAnnotation: !!layoutAnnotationDefaultTableLayout,
      row,
      column,
      rowSection,
      filter,
      mode
    };

    this.getDefaultLayout = this.getDefaultLayout.bind(this);
    this.onFlagSaveAnnotationChange = this.onFlagSaveAnnotationChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {

    if (props.dsdDimensions) {

      const {
        row,
        column,
        rowSection,
        filter
      } = state;

      return ({
        row: row.filter(id => props.dsdDimensions.find(dim => dim.id === id)),
        column: column.filter(id => props.dsdDimensions.find(dim => dim.id === id)),
        filter: filter.filter(id => props.dsdDimensions.find(dim => dim.id === id)),
        rowSection: [
          ...rowSection.filter(id => props.dsdDimensions.find(dim => dim.id === id)),
          ...props.dsdDimensions
            .filter(dim => ![...row, ...column, ...filter, ...rowSection].find(id => id === dim.id))
            .map(({id}) => id)
        ]
      });
    } else {
      return null;
    }
  }

  componentDidUpdate(prevProps) {

    if (this.props.dsdDimensions && (!prevProps.dsdDimensions || this.props.dsdDimensions.length !== prevProps.dsdDimensions.length)) {

      if (this.state.flagSaveAnnotation) {

        const {
          row,
          column,
          filter,
          rowSection
        } = this.state;

        this.props.onChange({
          layoutAnnotations: setLayoutAnnotationDefaultTableLayout(_.cloneDeep(this.props.layoutAnnotations),
            this.props.annotationsConfig,
            {
              row: row.filter(id => this.props.dsdDimensions.find(dim => dim.id === id)),
              column: column.filter(id => this.props.dsdDimensions.find(dim => dim.id === id)),
              filter: filter.filter(id => this.props.dsdDimensions.find(dim => dim.id === id)),
              rowSection: [
                ...rowSection.filter(id => this.props.dsdDimensions.find(dim => dim.id === id)),
                ...this.props.dsdDimensions
                  .filter(dim => ![...row, ...column, ...filter, ...rowSection].find(id => id === dim.id))
                  .map(({id}) => id)
              ]
            })
        });
      }
    }

  }

  getDefaultLayout() {
    return ({
      row: [],
      column: [],
      filter: [],
      rowSection:
        this.props.dsdDimensions
          .map(({id}) => id)
          .sort((a, b) =>
            a.order && b.order && a.order !== b.order
              ? a.order - b.order
              : a.id - b.id)
    });
  }

  onFlagSaveAnnotationChange(checked) {

    const {
      row,
      column,
      filter,
      rowSection
    } = this.state;

    this.props.onChange({
      layoutAnnotations: setLayoutAnnotationDefaultTableLayout(_.cloneDeep(this.props.layoutAnnotations),
        this.props.annotationsConfig,
        checked
          ? ({
            row,
            column,
            filter,
            rowSection
          })
          : null
      )
    });

    this.setState({
      flagSaveAnnotation: checked
    });
  }

  onDragEnd(source, destination) {

    if (source && destination) {
      let {
        row,
        column,
        filter,
        rowSection
      } = this.state;

      let dragged;

      if (source.droppableId === DROPPABLE_ID_ROW) {
        dragged = row[source.index];
        row.splice(source.index, 1)
      } else if (source.droppableId === DROPPABLE_ID_COLUMN) {
        dragged = column[source.index];
        column.splice(source.index, 1);
      } else if (source.droppableId === DROPPABLE_ID_FILTER) {
        dragged = filter[source.index];
        filter.splice(source.index, 1);
      } else {
        dragged = rowSection[source.index];
        rowSection.splice(source.index, 1);
      }

      if (destination.droppableId === DROPPABLE_ID_ROW) {
        row.splice(destination.index, 0, dragged)
      } else if (destination.droppableId === DROPPABLE_ID_COLUMN) {
        column.splice(destination.index, 0, dragged);
      } else if (destination.droppableId === DROPPABLE_ID_FILTER) {
        filter.splice(destination.index, 0, dragged);
      } else {
        rowSection.splice(destination.index, 0, dragged);
      }


      this.props.onChange({
        layoutAnnotations: setLayoutAnnotationDefaultTableLayout(_.cloneDeep(this.props.layoutAnnotations),
          this.props.annotationsConfig,
          {
            row,
            column,
            filter,
            rowSection
          })
      });

      this.setState({
        row,
        column,
        filter,
        rowSection,
        flagSaveAnnotation: true
      });
    }
  }

  render() {
    const {
      t,
      disabled
    } = this.props;

    const {
      flagSaveAnnotation,
      row,
      column,
      rowSection,
      filter,
      mode
    } = this.state;

    const Dimension = ({id, index}) =>
      <Draggable draggableId={id} index={index}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Row type="flex" style={{marginBottom: MARGIN_SM}}>
              <Col span={SPAN_FULL}>
                <Tag style={{
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }} title={id}>
                   <span {...provided.dragHandleProps}>
                      <DragHandle/>
                    </span>
                  {id}
                </Tag>
              </Col>
            </Row>
          </div>
        )}
      </Draggable>;

    const cardStyle = {
      style: {
        height: "100%",
      },
      bodyStyle: {
        minHeight: 120,
        position: "relative",
        padding: 0,
      }
    };

    const droppableStyle = {
      position: "absolute",
      height: "100%",
      width: "100%",
      padding: PADDING_MD,
      overflowY: "auto",
      overflowX: "hidden"
    };

    const filterCard =
      <Card
        type="inner"
        title={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.filter.title")}
        {...cardStyle}
      >
        <Droppable droppableId={DROPPABLE_ID_FILTER}>
          {(provided, {isDraggingOver}) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={droppableStyle}>
              {filter.map((id, index) => <Dimension id={id} key={index} index={index}/>)}
              {provided.placeholder}
              {filter.length === 0 && !isDraggingOver &&
              <CustomEmpty
                text={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.placeholder")}/>}
            </div>
          )}
        </Droppable>
      </Card>;

    const rowSectionCard =
      <Card
        type="inner"
        title={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.rowSection.title")}
        {...cardStyle}
      >
        <Droppable droppableId={DROPPABLE_ID_ROW_SECTION}>
          {(provided, {isDraggingOver}) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={droppableStyle}>
              {rowSection.map((id, index) => <Dimension id={id} key={index} index={index}/>)}
              {provided.placeholder}
              {rowSection.length === 0 && !isDraggingOver &&
              <CustomEmpty
                text={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.placeholder")}/>}
            </div>
          )}
        </Droppable>
      </Card>;

    const columnCard =
      <Card
        type="inner"
        title={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.column.title")}
        {...cardStyle}
      >
        <Droppable droppableId={DROPPABLE_ID_COLUMN}>
          {(provided, {isDraggingOver}) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={droppableStyle}>
              {column.map((id, index) => <Dimension id={id} key={index} index={index}/>)}
              {provided.placeholder}
              {column.length === 0 && !isDraggingOver &&
              <CustomEmpty
                text={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.placeholder")}/>}
            </div>
          )}
        </Droppable>
      </Card>;

    const rowCard =
      <Card
        type="inner"
        title={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.row.title")}
        {...cardStyle}
      >
        <div style={{height: "100%", backgroundColor: "red"}}>
          <Droppable droppableId={DROPPABLE_ID_ROW}>
            {(provided, {isDraggingOver}) => (
              <div{...provided.droppableProps} ref={provided.innerRef} style={droppableStyle}>
                {row.map((id, index) => <Dimension id={id} key={index} index={index}/>)}
                {provided.placeholder}
                {row.length === 0 && !isDraggingOver &&
                <CustomEmpty
                  text={t("components.annotationsForm.layoutAnnotationDefaultTableLayout.cards.placeholder")}/>}
              </div>
            )}
          </Droppable>
        </div>
      </Card>;

    return (
      <Fragment>
        {!disabled && (
          <Row type="flex" gutter={GUTTER_SM} style={{marginBottom: MARGIN_MD}}>
            <Col>
              {t("components.annotationsForm.layoutAnnotationDefaultTableLayout.flagSaveAnnotation.title")}:
            </Col>
            <Col>
              <Checkbox
                checked={flagSaveAnnotation}
                onChange={e => this.onFlagSaveAnnotationChange(e.target.checked)}
              />
            </Col>
          </Row>
        )}
        <Row gutter={GUTTER_MD}>
          <Col span={SPAN_HALF}>
            <DragDropContext
              onDragEnd={({source, destination}) => this.onDragEnd(source, destination)}
            >
              {mode === LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER
                ? (
                  <Fragment>
                    <Row gutter={GUTTER_SM} style={{marginBottom: MARGIN_SM}} type="flex">
                      <Col span={SPAN_HALF}>
                        {rowSectionCard}
                      </Col>
                      <Col span={SPAN_HALF}>
                        {rowCard}
                      </Col>
                    </Row>
                    <Row gutter={GUTTER_SM}>
                      <Col span={SPAN_HALF}>
                        {columnCard}
                      </Col>
                    </Row>
                  </Fragment>
                )
                : (
                  <Fragment>
                    <Row gutter={GUTTER_SM} style={{marginBottom: MARGIN_SM}} type="flex">
                      <Col span={SPAN_HALF}>
                        {filterCard}
                      </Col>
                      <Col span={SPAN_HALF}>
                        {rowSectionCard}
                      </Col>
                    </Row>
                    <Row gutter={GUTTER_SM} style={{marginBottom: MARGIN_SM}} type="flex">
                      <Col span={SPAN_HALF}>
                        {rowCard}
                      </Col>
                      <Col span={SPAN_HALF}>
                        {columnCard}
                      </Col>
                    </Row>
                  </Fragment>
                )}
            </DragDropContext>
          </Col>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="center">
              <Col>
                <Radio.Group
                  disabled={disabled}
                  value={mode}
                  onChange={({target}) => {

                    const foo = () => {
                      const {
                        row,
                        column,
                        rowSection,
                        filter
                      } = this.getDefaultLayout();

                      this.setState({
                        row,
                        column,
                        rowSection,
                        filter,
                        mode: target.value
                      });

                      if (flagSaveAnnotation) {
                        this.props.onChange({
                          layoutAnnotations: setLayoutAnnotationDefaultTableLayout(_.cloneDeep(this.props.layoutAnnotations),
                            this.props.annotationsConfig,
                            ({
                              row,
                              column,
                              rowSection,
                              filter
                            })
                          )
                        });
                      }
                    };

                    if (row.length > 0 || column.length > 0 || filter.length > 0) {
                      Modal.confirm({
                        title: t("components.annotationsForm.layoutAnnotationDefaultTableLayout.confirms.modeChange.title"),
                        content: t("components.annotationsForm.layoutAnnotationDefaultTableLayout.confirms.modeChange.content"),
                        onOk() {
                          foo()
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    } else {
                      foo();
                    }
                  }}
                >
                  <Radio.Button value={LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATABROWSER}>
                    {t('components.annotationsForm.layoutAnnotationDefaultTableLayout.modeRadio.dataBrowser.title')}
                  </Radio.Button>
                  <Radio.Button value={LAYOUT_ANNOTATION_DEFAULT_TABLE_LAYOUT_MODE_DATAEXPLORER}>
                    {t('components.annotationsForm.layoutAnnotationDefaultTableLayout.modeRadio.dataExplorer.title')}
                  </Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
            <Row justify="center" style={{marginTop: MARGIN_MD}}>
              <Col span={SPAN_FULL} style={{overflow: "auto"}}>
                <div
                  className="html-table"
                  dangerouslySetInnerHTML={{__html: getHtmlTableString(row, column, rowSection)}}
                  style={{maxHeight: 298}}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default compose(
  translate(),
)(DefaultTableLayout);
