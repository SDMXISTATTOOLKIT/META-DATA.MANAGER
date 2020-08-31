import React from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {Form} from "antd";
import _ from "lodash";
import Selector from "../../../../components/selector";
import {showNodesConfigMsds, unsetNodesConfigMsd} from "../actions";

const mapDispatchToProps = dispatch => ({
  onMsdsShow: nodeIndex => dispatch(showNodesConfigMsds(nodeIndex)),
  onMsdUnset: nodeIndex => dispatch(unsetNodesConfigMsd(nodeIndex))
});

const mapPropsToFields = ({DcatApIt}) => ({
  MSD: Form.createFormField({value: DcatApIt ? DcatApIt.MSD : null})
});

const onFieldsChange = (props, fields) => props.onChange(_.mapValues(fields, ({value}) => value));

const DcatApItForm = ({
                        t,
                        form,
                        nodeIndex,
                        onMsdsShow,
                        onMsdUnset
                      }) =>
  <Form>
    <Form.Item
      label={t("data.nodesConfig.dcatApIt.msd.label")}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator("MSD")(
        <Selector
          selectTitle={t('data.nodesConfig.dcatApIt.msd.select.title')}
          resetTitle={t('data.nodesConfig.dcatApIt.msd.reset.title')}
          onSelect={() => onMsdsShow(nodeIndex)}
          onReset={() => onMsdUnset(nodeIndex)}
        />
      )}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange}),
  connect(null, mapDispatchToProps)
)(DcatApItForm);
