import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import {
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  SPAN_HALF,
  SPAN_TWO_THIRDS,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../styles/constants";
import {Alert, Checkbox, Col, Row} from "antd";
import "./style.css"
import InfiniteScrollTable from "../infinite-scroll-table";
import Selector from "../selector";

const MAX_TOTAL_DIFFERENCE = 1000;

class ItemSchemesCompareReport extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isSourceItemsVisible: true,
      isTargetItemsVisible: true
    };

    this.changeSourceItemsVisibility = this.changeSourceItemsVisibility.bind(this);
    this.changeTargetItemsVisibility = this.changeTargetItemsVisibility.bind(this);
  }

  changeSourceItemsVisibility() {
    this.setState({...this.state, isSourceItemsVisible: !this.state.isSourceItemsVisible})
  }

  changeTargetItemsVisibility() {
    this.setState({...this.state, isTargetItemsVisible: !this.state.isTargetItemsVisible})
  }

  render() {

    const {
      t,
      report,
      onDetailShow
    } = this.props;

    const {
      isSourceItemsVisible,
      isTargetItemsVisible
    } = this.state;

    const sourceItem = report && report.sourceItem.map(item => ({
      sourceId: item.id,
      sourceName: item.names,
      targetId: null,
      targetName: null,
    }));

    const targetItem = report && report.targetItem.map(item => ({
      sourceId: null,
      sourceName: null,
      targetId: item.id,
      targetName: item.names,
    }));

    return (
      <Fragment>
        {
          report && report.totalDifference > MAX_TOTAL_DIFFERENCE && (
            <Alert
              type="warning"
              showIcon
              message={t("components.itemSchemesCompareReport.alerts.tooMuchDiff.message")}
            />
          )
        }
        <Row gutter={GUTTER_MD} justify="space-between" style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="start">
              <Col span={SPAN_TWO_THIRDS}>
                <Selector
                  value={report && report.sourceArtefact
                    ? `${report.sourceArtefact.id}+${report.sourceArtefact.agencyId}+${report.sourceArtefact.version}`
                    : null
                  }
                  detailTitle={t('components.itemSchemesCompareReport.selector.artefactDetail.title')}
                  onDetail={onDetailShow
                    ? () => onDetailShow({
                      id: report.sourceArtefact.id,
                      agencyID: report.sourceArtefact.agencyId,
                      version: report.sourceArtefact.version,
                    })
                    : null
                  }
                  disabled
                />
              </Col>
            </Row>
          </Col>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="end">
              <Col span={SPAN_TWO_THIRDS}>
                <Selector
                  value={report && report.targetArtefact
                    ? `${report.targetArtefact.id}+${report.targetArtefact.agencyId}+${report.targetArtefact.version}`
                    : null
                  }
                  detailTitle={t('components.itemSchemesCompareReport.selector.artefactDetail.title')}
                  onDetail={onDetailShow
                    ? () => onDetailShow({
                      id: report.targetArtefact.id,
                      agencyID: report.targetArtefact.agencyId,
                      version: report.targetArtefact.version,
                    })
                    : null
                  }
                  disabled
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={GUTTER_MD} justify="space-between" style={{marginBottom: MARGIN_MD}}>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="start" gutter={GUTTER_SM}>
              <Col>
                {t("components.itemSchemesCompareReport.showItem.label")}
              </Col>
              <Col>
                <Checkbox checked={isSourceItemsVisible} onChange={this.changeSourceItemsVisibility}/>
              </Col>
            </Row>
          </Col>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="end" gutter={GUTTER_SM}>
              <Col>
                {t("components.itemSchemesCompareReport.showItem.label")}
              </Col>
              <Col>
                <Checkbox checked={isTargetItemsVisible} onChange={this.changeTargetItemsVisibility}/>
              </Col>
            </Row>
          </Col>
        </Row>
        <div className="item-schemes-compare-report__infinite-scroll-table">
          <InfiniteScrollTable
            data={(isSourceItemsVisible ? (sourceItem || []) : []).concat(isTargetItemsVisible ? (targetItem || []) : [])}
            getRowKey={({sourceId, targetId}) => sourceId + targetId}
            multilangStrDataIndexes={["sourceName", "targetName"]}
            columns={[
              {
                title: t('data.item.id.shortLabel'),
                dataIndex: 'sourceId',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              },
              {
                title: t('data.item.name.shortLabel'),
                dataIndex: 'sourceName',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              },
              {
                title: t('data.item.id.shortLabel'),
                dataIndex: 'targetId',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              },
              {
                title: t('data.item.name.shortLabel'),
                dataIndex: 'targetName',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              }
            ]}
          />
        </div>
      </Fragment>
    )
  }
}

export default translate()(ItemSchemesCompareReport);