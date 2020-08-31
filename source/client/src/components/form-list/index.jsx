import React, {Fragment} from 'react';
import {compose} from 'redux';
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Card, Col, Collapse, Divider, Modal, Row} from 'antd';
import _ from "lodash";
import CustomEmpty from "../custom-empty";
import "./style.css"
import {PADDING_MD} from "../../styles/constants";
import {scrollTo} from "../../middlewares/scrollTo/actions";
import uuidv4 from "uuid";

const $ = window.jQuery;

const mapDispatchToProps = dispatch => ({
  scrollToLastInput: lastListItem => dispatch(scrollTo(lastListItem)),
});

class FormList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
      className: uuidv4()
    }
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.values && this.props.values && prevProps.values.length < this.props.values.length) {

      const listItems = $(`.${this.state.className} .form-list__list-item`);

      window.setTimeout(() => this.props.scrollToLastInput(listItems[listItems.length - 1]), 250);
    }
  }

  render() {

    const {
      disabled = false
    } = this.props;

    return (
      <div className={this.state.className}>
        <Fragment>
          {
            (this.props.values && this.props.values.length > 0)
              ? (
                <Collapse
                  bordered={false}
                  defaultActiveKey={["1"]}
                  onChange={key =>
                    key.includes("1")
                      ? this.setState({expanded: true})
                      : this.setState({expanded: false})
                  }
                  activeKey={this.state.expanded ? '1' : ''}
                >
                  <Collapse.Panel
                    header={
                      this.state.expanded
                        ? this.props.t("components.formList.collapse.collapse.label")
                        : this.props.t("components.formList.collapse.expand.label", {
                          count: this.props.values.length
                        })
                    }
                    className={"form-list__collapse-panel__header__text"}
                    key="1"
                    style={{border: 0}}
                  >
                    <Card bodyStyle={{padding: 0}}>
                      {
                        this.props.values && this.props.values.map((value, index) =>
                          <Fragment key={index}>
                            <div
                              style={{padding: PADDING_MD}}
                              className="form-list__list-item"
                            >
                              {(() => {

                                const item =
                                  <this.props.Component
                                    value={value}
                                    disabled={disabled}
                                    onChange={fields => {
                                      const newValues = _.cloneDeep(this.props.values);

                                      const customizer = (_, src) => {
                                        if (Array.isArray(src))
                                          return src;
                                        else {
                                          return undefined
                                        }
                                      };

                                      newValues[index] = _.mergeWith(newValues[index], fields, customizer);

                                      this.props.onChange(newValues)
                                    }}
                                  />;

                                const removeButton =
                                  <Button
                                    icon="delete"
                                    title={
                                      this.props.compact
                                        ? (
                                          this.props.removeItemLabel
                                            ? this.props.removeItemLabel
                                            : this.props.t("components.formList.buttons.remove.title")
                                        )
                                        : null
                                    }
                                    onClick={
                                      () =>
                                        Modal.confirm({
                                          title: this.props.t("components.formList.removeAlert.title"),
                                          onOk: () => {
                                            const newValues = _.cloneDeep(this.props.values);
                                            newValues.splice(index, 1);
                                            this.props.onChange(newValues)
                                          },
                                          cancelText: this.props.t('commons.buttons.cancel.title')
                                        })
                                    }
                                    disabled={disabled || (this.props.minItems ? this.props.values.length <= this.props.minItems : false)}
                                  >
                                    {
                                      !this.props.compact
                                        ? (
                                          this.props.removeItemLabel
                                            ? this.props.removeItemLabel
                                            : this.props.t("components.formList.buttons.remove.title")
                                        )
                                        : null
                                    }
                                  </Button>;

                                return this.props.compact
                                  ? (
                                    <Row type="flex" justify="space-between">
                                      <Col>
                                        {item}
                                      </Col>
                                      <Col>
                                        {removeButton}
                                      </Col>
                                    </Row>
                                  )
                                  : (
                                    <Fragment>
                                      {item}
                                      <Divider style={{marginTop: 16, marginBottom: 16}}/>
                                      <Row type={"flex"} justify={"end"}>
                                        <Col>
                                          {removeButton}
                                        </Col>
                                      </Row>
                                    </Fragment>
                                  );
                              })()}
                            </div>
                            {index < this.props.values.length - 1 && <Divider style={{marginTop: 0, marginBottom: 0}}/>}
                          </Fragment>
                        )
                      }
                    </Card>
                  </Collapse.Panel>
                </Collapse>
              )
              : <CustomEmpty/>
          }

          <Row
            type="flex"
            justify="start"
            style={{
              marginLeft: 16,
              marginBottom: 8,
              marginTop: (this.props.values && this.props.values.length > 0) ? 0 : 8
            }}
          >
            <Col>
              <Button
                icon="plus"
                disabled={disabled}
                onClick={
                  () => {
                    const newValues = _.cloneDeep(this.props.values);
                    newValues.push(_.cloneDeep(this.props.newItem));
                    this.setState({expanded: true});
                    this.props.onChange(newValues)
                  }
                }
              >
                {
                  this.props.addItemLabel
                    ? this.props.addItemLabel
                    : this.props.t("components.formList.buttons.add.title")
                }
              </Button>
            </Col>
          </Row>
        </Fragment>
      </div>
    )
  }
}

export default compose(
  translate(),
  connect(null, mapDispatchToProps)
)(FormList);
