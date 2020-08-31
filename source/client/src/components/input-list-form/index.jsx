import React, {Fragment} from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Col, Collapse, Divider, Form, Icon, Input, List, Row} from "antd";
import _ from "lodash";
import CustomEmpty from "../custom-empty"
import "./style.css"
import {scrollTo} from "../../middlewares/scrollTo/actions";
import uuidv4 from 'uuid';

const $ = window.jQuery;

const mapDispatchToProps = dispatch => ({
  scrollToLastInput: lastListItem => dispatch(scrollTo(lastListItem)),
});

const mapPropsToFields = ({values}) => ({
  values:
    values
      ? values.map(value => (Form.createFormField({value: value})))
      : null
});

const onFieldsChange = (props, fields) => {
  const newValues = _.cloneDeep(props.values);
  props.onChange(_.merge(newValues, fields.values.map(el => el.value)));
};

class InputListForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
      className: uuidv4()
    }
  }

  componentDidUpdate(prevProps, prevState) {

    if (prevProps.values && this.props.values && prevProps.values.length < this.props.values.length) {

      const listItems = $(`.${this.state.className} .input-list-form__list-item`);

      window.setTimeout(() => this.props.scrollToLastInput(listItems[listItems.length - 1]), 250);
    }
  }

  render() {
    return (
      <div className={this.state.className}>
        <Form>
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
                        ? this.props.t("components.inputListForm.collapse.collapse.label")
                        : this.props.t("components.inputListForm.collapse.expand.label", {
                          count: this.props.values.length
                        })
                    }
                    className={"input-list-form__collapse-panel__header__text"}
                    key="1"
                    style={{border: 0, fontStyle: "italic", color: "red"}}
                  >
                    <List
                      bordered={true}
                      split={true}
                      size="small"
                    >
                      {
                        this.props.values && this.props.values.map((value, index) =>
                          <Fragment key={index}>
                            <List.Item className="input-list-form__list-item">
                              <Form.Item style={{marginTop: 0, marginBottom: 4}}>
                                {this.props.form.getFieldDecorator(`values[${index}]`)(
                                  <Input
                                    title={this.props.form.getFieldValue(`values[${index}]`)}
                                    className={
                                      (this.props.minItems && this.props.values.length <= this.props.minItems)
                                        ? 'input-list-form__input--addon-after--disabled'
                                        : 'input-list-form__input--addon-after--enabled'
                                    }
                                    addonAfter={
                                      <Icon
                                        type="delete"
                                        onClick={
                                          () => {
                                            if (!this.props.minItems || this.props.values.length > this.props.minItems) {
                                              const newValues = _.cloneDeep(this.props.values);
                                              newValues.splice(index, 1);
                                              this.props.onChange(newValues)
                                            }
                                          }
                                        }
                                        title={
                                          this.props.removeItemLabel
                                            ? this.props.removeItemLabel
                                            : this.props.t("components.inputListForm.buttons.remove.title")
                                        }
                                        style={{
                                          cursor: `${(this.props.minItems && this.props.values.length <= this.props.minItems) ? 'not-allowed' : 'pointer'}`,
                                          color: `${(this.props.minItems && this.props.values.length <= this.props.minItems) ? 'rgba(0, 0, 0, 0.25)' : ''}`
                                        }}
                                      />
                                    }
                                  />
                                )}
                              </Form.Item>
                            </List.Item>
                            {
                              this.props.values && index !== (this.props.values.length - 1) &&
                              <Divider style={{marginTop: 0, marginBottom: 0}}/>
                            }
                          </Fragment>
                        )
                      }
                    </List>
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
                onClick={
                  () => {
                    let newValues = _.cloneDeep(this.props.values);
                    if (!newValues) {
                      newValues = [];
                    }
                    newValues.push("");
                    this.setState({expanded: true});
                    this.props.onChange(newValues)
                  }
                }
              >
                {
                  this.props.addItemLabel
                    ? this.props.addItemLabel
                    : this.props.t("components.inputListForm.buttons.add.title")
                }
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

export default compose(
  translate(),
  connect(null, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(InputListForm);
