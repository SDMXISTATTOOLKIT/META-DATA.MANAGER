import {Button} from 'antd';
import {MODAL_WIDTH_LG} from '../../styles/constants';
import React from 'react';
import _ from 'lodash';
import {translate} from 'react-i18next';
import EnhancedModal from '../enhanced-modal';
import {getFilterStrFromViewerObj} from "../../utils/filter";
import InfiniteScrollDataTable from "../infinite-scroll-data-table";

const QueryPreview = ({
                        t,
                        cube,
                        rows,
                        filterStr,
                        isRowsModalVisible,
                        onRowsModalHide,
                        fetchRows
                      }) =>
  <EnhancedModal
    visible={isRowsModalVisible}
    onCancel={onRowsModalHide}
    footer={<Button onClick={onRowsModalHide}>{t('commons.buttons.close.title')}</Button>}
    width={MODAL_WIDTH_LG}
    title={t('scenes.dataManager.dataflowBuilder.wizard.query.preview.rowsModal.title')}
  >
    <InfiniteScrollDataTable
      data={rows && rows.Data}
      cols={rows && rows.Columns}
      rowTotal={rows && rows.Count}
      onChange={
        ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchRows(
          cube !== null ? cube.IDCube : null,
          cube !== null
            ? _.flatten(
            Object.keys(cube.columns)
              .map(key => cube.columns[key])
            )
              .filter(col => col.checked)
              .map(col => col.name)
            : null,
          getFilterStrFromViewerObj(
            rows && rows.Columns.filter(colName => colName !== '_OBS_VALUE'),
            searchText,
            filters,
            filterStr
          ),
          pageNum,
          pageSize,
          sortCol ? [sortCol] : null,
          sortByDesc
        )
      }
    />
  </EnhancedModal>;

export default translate()(QueryPreview);
