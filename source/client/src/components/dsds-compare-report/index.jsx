import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import {Button, Tabs} from "antd";
import ComponentsCompareTable from "./ComponentsCompareTable";
import ComponentsDetailCompareTable from "./ComponentsDetailCompareTable";
import _ from "lodash"
import {MODAL_WIDTH_LG} from "../../styles/constants";
import EnhancedModal from '../enhanced-modal';
import ItemSchemesCompareReport from "../item-schemes-compare-report";
import ReduxCodelistDetailModal from "../../redux-components/redux-codelist-detail-modal";
import GroupsDetailCompareTable from "./GroupsDetailCompareTable";

const tabPaneStyle = {
  maxHeight: 640,
  overflow: 'auto',
  padding: 8
};

const getStringFromTriplet = triplet => triplet ? `${triplet.id}+${triplet.agencyId}+${triplet.version}` : '';

// used to filter cases where the only difference is in attachmentLevel
const getFilteredDifferenceAttributes = differenceAttributes => differenceAttributes.filter(component => (
  (component.source && !component.target) ||
  (!component.source && component.target) || (
    getStringFromTriplet(component.source) !== getStringFromTriplet(component.target) ||
    (component.codelistCompare || {}).totalDifference > 0
  )
));

const DsdsCompareReport = ({
                             t,
                             report,
                             codelistDetail,
                             codelistDetailInstancePrefix,
                             onCodelistDetailShow,
                             codelistCompareReport,
                             fetchCodelistCompareReport,
                             onCodelistCompareReportHide
                           }) =>
  <Fragment>
    <Tabs>
      <Tabs.TabPane
        key="dimensions"
        tab={t('components.dsdsCompareReport.tabs.dimensions.title',
          {count: report.sourceDimensions.length + report.targetDimensions.length})
        }
        style={{...tabPaneStyle}}
        disabled={report.sourceDimensions.length + report.targetDimensions.length === 0}
      >
        <ComponentsCompareTable
          sourceComponents={report.sourceDimensions}
          targetComponents={report.targetDimensions}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="dimensionsDetail"
        tab={t('components.dsdsCompareReport.tabs.dimensionsDetail.title',
          {count: _.unionBy(report.differenceDimensions, report.differenceConceptSchemeDimensions, "key").length})
        }
        style={{...tabPaneStyle}}
        disabled={_.unionBy(report.differenceDimensions, report.differenceConceptSchemeDimensions, "key").length === 0}
      >
        <ComponentsDetailCompareTable
          commonComponentsCodelist={report.differenceDimensions}
          commonComponentsConcept={report.differenceConceptSchemeDimensions}
          fetchCodelistCompareReport={fetchCodelistCompareReport}
          sourceFile={report.sourceFile}
          targetFile={report.targetFile}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="attributes"
        tab={t('components.dsdsCompareReport.tabs.attributes.title',
          {count: report.sourceAttributes.length + report.targetAttributes.length})
        }
        style={{...tabPaneStyle}}
        disabled={report.sourceAttributes.length + report.targetAttributes.length === 0}
      >
        <ComponentsCompareTable
          sourceComponents={report.sourceAttributes}
          targetComponents={report.targetAttributes}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="attributesDetail"
        tab={t('components.dsdsCompareReport.tabs.attributesDetail.title',
          {count: getFilteredDifferenceAttributes(report.differenceAttributes).length})
        }
        style={{...tabPaneStyle}}
        disabled={getFilteredDifferenceAttributes(report.differenceAttributes).length === 0}
      >
        <ComponentsDetailCompareTable
          commonComponentsCodelist={getFilteredDifferenceAttributes(report.differenceAttributes)}
          commonComponentsConcept={report.differenceConceptSchemeAttributes}
          fetchCodelistCompareReport={fetchCodelistCompareReport}
          sourceFile={report.sourceFile}
          targetFile={report.targetFile}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="measures"
        tab={t('components.dsdsCompareReport.tabs.measures.title',
          {count: report.sourceMeasures.length + report.targetMeasures.length})
        }
        style={{...tabPaneStyle}}
        disabled={report.sourceMeasures.length + report.targetMeasures.length === 0}
      >
        <ComponentsCompareTable
          sourceComponents={report.sourceMeasures}
          targetComponents={report.targetMeasures}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="groups"
        tab={t('components.dsdsCompareReport.tabs.groups.title',
          {count: report.sourceGroups.length + report.targetGroups.length})
        }
        style={{...tabPaneStyle}}
        disabled={report.sourceGroups.length + report.targetGroups.length === 0}
      >
        <ComponentsCompareTable
          sourceComponents={report.sourceGroups}
          targetComponents={report.targetGroups}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="groupsDetail"
        tab={t('components.dsdsCompareReport.tabs.groupsDetail.title',
          {count: report.differenceGroups.length})
        }
        style={{...tabPaneStyle}}
        disabled={report.differenceGroups.length === 0}
      >
        <GroupsDetailCompareTable
          commonComponentsGroups={report.differenceGroups}
        />
      </Tabs.TabPane>
    </Tabs>
    <EnhancedModal
      title={t('components.dsdsCompareReport.modals.codelistCompare.title')}
      width={MODAL_WIDTH_LG}
      visible={codelistCompareReport !== null && codelistCompareReport !== undefined}
      onCancel={onCodelistCompareReportHide}
      footer={
        <div>
          <Button onClick={onCodelistCompareReportHide}>
            {t('commons.buttons.close.title')}
          </Button>
        </div>
      }
    >
      <ItemSchemesCompareReport
        report={codelistCompareReport}
        onDetailShow={onCodelistDetailShow}
      />
    </EnhancedModal>
    <ReduxCodelistDetailModal
      instancePrefix={codelistDetailInstancePrefix}
      instanceState={codelistDetail}
    />
  </Fragment>;


export default translate()(DsdsCompareReport);