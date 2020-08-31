import React from "react";
import {MODAL_WIDTH_LG, TABLE_COL_MIN_WIDTH_ID, TABLE_COL_MIN_WIDTH_NAME} from "../../styles/constants";
import {translate} from 'react-i18next';
import {Button} from "antd";
import EnhancedModal from "../../components/enhanced-modal";
import {getLayoutAnnotations} from "../../utils/annotations";
import InfiniteScrollTable from "../infinite-scroll-table";
import {compose} from 'redux';
import {connect} from "react-redux";

const mapStateToProps = state => ({
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId
});

const LayoutAnnotationList = ({
                              t,
                              endpoints,
                              endpointId,
                              annotations,
                              title,
                              onClose
                            }) => {

  const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;

  return (
    <EnhancedModal
      visible={annotations != null}
      onCancel={onClose}
      footer={<Button onClick={onClose}>{t('commons.buttons.close.title')}</Button>}
      width={MODAL_WIDTH_LG}
      title={t('components.layoutAnnotationList.title') + (title ? `: ${title}` : '')}
      withDataLanguageSelector
    >
      <InfiniteScrollTable
        data={annotations
          ? getLayoutAnnotations(annotations, annotationsConfig).map((annot, key) => ({...annot, key: key}))
          : []
        }
        getRowKey={({key}) => key}
        multilangStrDataIndexes={['text']}
        columns={[
          {
            title: t('data.annotation.id.label'),
            dataIndex: 'id',
            minWidth: TABLE_COL_MIN_WIDTH_ID
          },
          {
            title: t('data.annotation.title.label'),
            dataIndex: 'title',
            minWidth: TABLE_COL_MIN_WIDTH_NAME
          },
          {
            title: t('data.annotation.type.label'),
            dataIndex: 'type',
            minWidth: TABLE_COL_MIN_WIDTH_NAME
          },
          {
            title: t('data.annotation.text.label'),
            dataIndex: 'text',
            minWidth: TABLE_COL_MIN_WIDTH_NAME
          }
        ]}
      />
    </EnhancedModal>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps)
)(LayoutAnnotationList);
