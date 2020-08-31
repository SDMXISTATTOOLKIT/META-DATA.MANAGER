import React from 'react';
import Call from "../../hocs/call";
import {MODAL_WIDTH_MD, TABLE_COL_MIN_WIDTH_NAME} from "../../styles/constants";
import {Button} from "antd";
import EnhancedModal from "../enhanced-modal";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import InfiniteScrollTable from "../infinite-scroll-table";

const mapStateToProps = state => ({
  username: state.app.user.username
});

const ArtefactOwnershipModal = ({
                                  t,
                                  isVisible,
                                  users,
                                  owners,
                                  fetchUsers,
                                  fetchOwners,
                                  onOwnersChange,
                                  onSubmit,
                                  onClose,
                                  username
                                }) =>
  <EnhancedModal
    visible={isVisible}
    width={MODAL_WIDTH_MD}
    title={t('components.artefactOwnershipModal.title')}
    onCancel={onClose}
    footer={
      <div>
        <Button onClick={onClose}>{t('commons.buttons.close.title')}</Button>
        <Button type="primary" onClick={onSubmit}>
          {t('commons.buttons.save.title')}
        </Button>
      </div>
    }
  >
    <Call cb={fetchUsers} disabled={users !== null}>
      <Call cb={fetchOwners} disabled={owners !== null}>
        <InfiniteScrollTable
          data={users}
          getRowKey={({username}) => username}
          getIsDisabledRow={utente => utente.username === username}
          columns={[
            {
              title: t('data.user.username.label'),
              dataIndex: 'username',
              minWidth: TABLE_COL_MIN_WIDTH_NAME
            },
            {
              title: t('data.user.email.label'),
              dataIndex: 'email',
              minWidth: TABLE_COL_MIN_WIDTH_NAME
            }
          ]}
          rowSelection={{
            selectedRowKeys: owners || [],
            onChange: checkedArr => {
              if (!checkedArr.find(el => el === username)) {
                checkedArr.push(username)
              }
              onOwnersChange(checkedArr)
            },
          }}
        />
      </Call>
    </Call>
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps)
)(ArtefactOwnershipModal);
