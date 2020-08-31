import React from "react";
import {Button, Card, Col, Row} from "antd";
import Call from "../../../hocs/call";
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {
  changeSyncCodelistsCodelistsToSync,
  readSyncCodelistCodelistToSyncList,
  submitSyncCodelistsSyncCodelists
} from "./actions";
import {MARGIN_MD, TABLE_COL_MIN_WIDTH_ID} from "../../../styles/constants";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  codelists: state.scenes.dataManager.syncCodelist.codelists,
  selectedCodelists: state.scenes.dataManager.syncCodelist.selectedCodelists
});

const mapDispatchToProps = dispatch => ({
  fetchCodelistToSync: () => dispatch(readSyncCodelistCodelistToSyncList()),
  onCodelistsToSyncChange: selectedCodelists => dispatch(changeSyncCodelistsCodelistsToSync(selectedCodelists)),
  onSyncCodelistsSubmit: (codelistsToSync, codelists) =>
    dispatch(submitSyncCodelistsSyncCodelists(codelistsToSync, codelists))
});

const SyncCodelist = ({
                        t,
                        codelists,
                        selectedCodelists,
                        fetchCodelistToSync,
                        onCodelistsToSyncChange,
                        onSyncCodelistsSubmit
                      }) =>
  <Card
    title={t("scenes.dataManager.syncCodelist.title")}
    type="inner"
  >
    <Call cb={fetchCodelistToSync} disabled={codelists !== null}>
      <Row>
        <Col>
          <InfiniteScrollTable
            data={codelists}
            getRowKey={codelist => `${codelist.id}+${codelist.agency}+${codelist.version}`}
            columns={[
              {
                title: t('data.artefact.id.shortLabel'),
                dataIndex: 'id',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              },
              {
                title: t('data.artefact.agencyID.shortLabel'),
                dataIndex: 'agency',
                minWidthToContent: true,
                withValuesFilter: true
              },
              {
                title: t('data.artefact.version.shortLabel'),
                dataIndex: 'version',
                minWidthToContent: true,
                withValuesFilter: true
              },
              {
                title: t('scenes.dataManager.syncCodelist.itemsToSync.label'),
                dataIndex: 'itemsToSync',
                minWidthToContent: true,
                withValuesFilter: true
              }
            ]}
            rowSelection={{
              selectedRowKeys: selectedCodelists,
              onChange: selectedArr => onCodelistsToSyncChange(selectedArr)
            }}
          />
        </Col>
      </Row>
      <Row type="flex" justify="end" style={{marginTop: MARGIN_MD}}>
        <Col>
          {selectedCodelists &&
          <Button
            disabled={!selectedCodelists || selectedCodelists.length === 0}
            type="primary"
            onClick={() => onSyncCodelistsSubmit(selectedCodelists, codelists)}
          >
            {selectedCodelists.length > 0
              ? t('scenes.dataManager.syncCodelist.buttons.sync.title', {count: selectedCodelists.length})
              : t('scenes.dataManager.syncCodelist.buttons.syncEmpty.title')
            }
          </Button>
          }
        </Col>
      </Row>
    </Call>
  </Card>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SyncCodelist);
