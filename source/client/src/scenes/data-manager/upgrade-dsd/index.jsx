import React, {Fragment} from "react";
import {translate} from 'react-i18next';
import DsdsList from "./DsdList";
import {connect} from 'react-redux';
import {compose} from "redux";
import EnhancedModal from "../../../components/enhanced-modal";
import {MODAL_WIDTH_LG, TABLE_COL_MIN_WIDTH_ID, TABLE_COL_MIN_WIDTH_NAME} from "../../../styles/constants";
import {Button} from "antd";
import {hideUpgradeDsdDataflows} from "./actions";
import UpgradedDsdsList from "./UpgradedDsdsList";
import ReduxdsdDetailModal from "../../../redux-components/redux-dsd-detail-modal";
import {DM_UPGRADE_DSD_DSD_DETAIL_PREFIX} from "./reducer";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  dsdDetail: state.scenes.dataManager.upgradeDsd.dsdDetail,
  dataflows: state.scenes.dataManager.upgradeDsd.dataflows,
});

const mapDispatchToProps = dispatch => ({
  onDataflowsHide: () => dispatch(hideUpgradeDsdDataflows())
});

const UpgradeDSD = ({
                      t,
                      dsdDetail,
                      dataflows,
                      onDataflowsHide,
                    }) =>
  <Fragment>
    <DsdsList/>
    <UpgradedDsdsList/>
    <ReduxdsdDetailModal
      instancePrefix={DM_UPGRADE_DSD_DSD_DETAIL_PREFIX}
      instanceState={dsdDetail}
    />
    <EnhancedModal
      visible={dataflows !== null}
      onCancel={onDataflowsHide}
      title={t('scenes.dataManager.upgradeDsd.modals.dataflowList.title')}
      withDataLanguageSelector
      width={MODAL_WIDTH_LG}
      footer={<Button onClick={onDataflowsHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <InfiniteScrollTable
        data={(dataflows || []).sort((a, b) => a.id.localeCompare(b.id))}
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
          }
        ]}
        multilangStrDataIndexes={["names"]}
      />
    </EnhancedModal>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(UpgradeDSD);
