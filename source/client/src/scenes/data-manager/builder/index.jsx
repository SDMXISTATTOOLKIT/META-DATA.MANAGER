import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';

import {Button, Col, Row} from 'antd';
import './style.css';

import {GUTTER_MD, MARGIN_MD, SPAN_FULL, SPAN_HALF,} from '../../../styles/constants';
import BuilderDsdsList from './dsd-list';
import {showBuilderDsdList} from './dsd-list/actions';
import BuilderCubeTree from './cube-tree';
import BuilderCubeForm from './cube-form';

const mapDispatchToProps = dispatch => ({
  onDsdListShow: () => dispatch(showBuilderDsdList())
});

const Builder = ({
                   t,
                   onDsdListShow
                 }) =>
  <Fragment>
    <BuilderDsdsList/>
    <Row gutter={GUTTER_MD}>
      <Col span={SPAN_HALF}>
        <div className="builder__cube-tree">
          <BuilderCubeTree/>
        </div>
      </Col>
      <Col span={SPAN_HALF}>
        <Row type="flex" justify="end">
          <Col>
            <Button onClick={onDsdListShow} type="primary">
              {t('scenes.dataManager.builder.dsdListShowButton.label')}
            </Button>
          </Col>
        </Row>
        <Row style={{marginTop: MARGIN_MD}}>
          <Col span={SPAN_FULL}>
            <BuilderCubeForm/>
          </Col>
        </Row>
      </Col>
    </Row>
  </Fragment>;

export default compose(
  translate(),
  connect(null, mapDispatchToProps)
)(Builder);
