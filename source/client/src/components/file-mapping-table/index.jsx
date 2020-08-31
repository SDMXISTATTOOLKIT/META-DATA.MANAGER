import React from 'react';
import {translate} from 'react-i18next';
import {BUTTON_DELETE, BUTTON_DETAIL} from "../../styles/buttons";
import {TABLE_COL_MIN_WIDTH_NAME} from "../../styles/constants";
import InfiniteScrollTable from "../infinite-scroll-table";

const FileMappingTable = ({
                            t,
                            fileMappings,
                            onFileMappingDetail,
                            onFileMappingDelete,
                            onFileMappingDeleteAll,
                            onFileMappingClick,
                            rightActions
                          }) =>
  <InfiniteScrollTable
    data={fileMappings}
    getRowKey={fileMapping => fileMapping.IDMapping}
    columns={[
      {
        title: t('data.fileMapping.name.label'),
        dataIndex: 'Name',
        minWidth: TABLE_COL_MIN_WIDTH_NAME
      },
      {
        title: t('data.fileMapping.description.label'),
        dataIndex: 'Description',
        minWidth: TABLE_COL_MIN_WIDTH_NAME
      }
    ]}
    onRowClick={
      onFileMappingClick ?
        fileMapping => onFileMappingClick(fileMapping.IDMapping)
        : null
    }
    actions={[]
      .concat(onFileMappingDetail
        ? {
          ...BUTTON_DETAIL,
          title: t('components.fileMappingTable.actions.detail.title'),
          onClick: fileMapping => onFileMappingDetail ? onFileMappingDetail(fileMapping.IDMapping) : null,
        }
        : []
      )
      .concat(onFileMappingDelete
        ? {
          ...BUTTON_DELETE,
          title: t('components.fileMappingTable.actions.delete.title'),
          onClick: (fileMapping, deselect) => {
            if (onFileMappingDelete) {
              onFileMappingDelete(fileMapping.IDMapping, deselect)
            }
          }
        }
        : []
      )
    }
    tableActions={
      onFileMappingDeleteAll
        ? [({
          icon: "delete",
          title: t('components.fileMappingTable.actions.deleteAll.title'),
          onClick: (fileMappings, deselect) => {
            if (onFileMappingDeleteAll) {
              deselect();
              onFileMappingDeleteAll(fileMappings.map(mapp => mapp.IDMapping))
            }
          }
        })]
        : null
    }
    rightActions={rightActions}
  />;

export default translate()(FileMappingTable);
