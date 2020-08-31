import React from "react";
import {translate} from 'react-i18next';
import {readUpgradeDsdDsds, showUpgradeDsdDataflows, showUpgradeDsdUpgradedDsds,} from "./actions";
import Call from "../../../hocs/call";
import {connect} from "react-redux";
import {compose} from "redux";
import {BUTTON_DATAFLOW_LIST, BUTTON_DETAIL, BUTTON_DSD_UPGRADE} from "../../../styles/buttons";
import {Icon} from "antd";
import {reuseAction} from "../../../utils/reduxReuse";
import {showDsdDetail} from "../../../redux-components/redux-dsd-detail-modal/actions";
import {DM_UPGRADE_DSD_DSD_DETAIL_PREFIX} from "./reducer";
import {TABLE_COL_MIN_WIDTH_ID, TABLE_COL_MIN_WIDTH_NAME} from "../../../styles/constants";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  dsds: state.scenes.dataManager.upgradeDsd.dsds,
});

const mapDispatchToProps = dispatch => ({
  fetchDsds: () => dispatch(readUpgradeDsdDsds()),
  onDetailShow: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), DM_UPGRADE_DSD_DSD_DETAIL_PREFIX)),
  onUpgradedDsdsShow: dsdTripelt => dispatch(showUpgradeDsdUpgradedDsds(dsdTripelt)),
  onDataflowListShow: dataflows => dispatch(showUpgradeDsdDataflows(dataflows)),
});

const DsdsList = ({
                    t,
                    dsds,
                    fetchDsds,
                    onDetailShow,
                    onUpgradedDsdsShow,
                    onDataflowListShow
                  }) =>
  <Call cb={fetchDsds} disabled={dsds !== null}>
    <InfiniteScrollTable
      data={(dsds || []).sort((a, b) => a.id.localeCompare(b.id))}
      getRowKey={({id, agency, version}) => `${id}+${agency}+${version}`}
      columns={[
        {
          title: t('data.artefact.id.shortLabel'),
          dataIndex: 'id',
          minWidth: TABLE_COL_MIN_WIDTH_ID
        },
        {
          title: t('data.artefact.agencyID.shortLabel'),
          dataIndex: 'agency',
          widthToContent: true,
          withValuesFilter: true
        },
        {
          title: t('data.artefact.name.shortLabel'),
          dataIndex: 'names',
          minWidth: TABLE_COL_MIN_WIDTH_NAME
        },
        {
          title: t('data.artefact.version.shortLabel'),
          dataIndex: 'version',
          widthToContent: true,
          withValuesFilter: true
        },
        {
          title: t('data.artefact.isFinal.shortLabel'),
          dataIndex: "isFinal",
          width: 30,
          withValuesFilter: true,
          render: isFinal => isFinal
            ? <Icon type="check"/>
            : null,
          renderText: isFinal => isFinal
            ? t('data.artefact.isFinal.values.final')
            : t('data.artefact.isFinal.values.notFinal'),
        }
      ]}
      multilangStrDataIndexes={["names"]}
      actions={[
        {
          ...BUTTON_DETAIL,
          title: t('commons.actions.detailReadOnly.title'),
          onClick: ({id, agency, version}) => onDetailShow({id, agencyID: agency, version})
        },
        {
          ...BUTTON_DATAFLOW_LIST,
          title: t('commons.actions.dataflowList.title'),
          onClick: ({dataflows}) => onDataflowListShow(dataflows)
        },
        {
          ...BUTTON_DSD_UPGRADE,
          title: t('commons.actions.upgradeDsd.title'),
          onClick: ({id, agency, version}) => onUpgradedDsdsShow({id, agencyID: agency, version})
        },
      ]}
    />
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DsdsList);
