import React from 'react';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {compose} from "redux";
import {changeSetPermissionsAgenciesPermissions, readSetPermissionsAgencies} from "./actions";
import Call from "../../../hocs/call";
import {getLocalizedStr} from "../../../middlewares/i18n/utils";
import {Button, Col, Row} from "antd";
import {GUTTER_SM} from "../../../styles/constants";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  agencies: state.scenes.manageUsers.setPermissions.agencies,
  permissions: state.scenes.manageUsers.setPermissions.permissions
});

const mapDispatchToProps = dispatch => ({
  onChange: agenciesPermissions => dispatch(changeSetPermissionsAgenciesPermissions(agenciesPermissions)),
  fetchAgencies: () => dispatch(readSetPermissionsAgencies())
});

const SetPermissionsAgencies = ({
                                  t,
                                  agencies,
                                  permissions,
                                  onChange,
                                  appLanguage,
                                  dataLanguages,
                                  fetchAgencies
                                }) =>
  <Call cb={fetchAgencies}>
    {agencies && (
      <InfiniteScrollTable
        showHeader={false}
        height={284}
        data={
          Object.keys(agencies).map(agencyID => {
            const agencyName = getLocalizedStr((agencies[agencyID]), appLanguage, dataLanguages);
            return ({
              id: agencyID,
              label: agencyName ? `${agencyID} - ${agencyName}` : agencyID
            });
          })
        }
        getRowKey={({id}) => id}
        columns={[
          {
            dataIndex: 'label',
            minWidht: 150
          }
        ]}
        rowSelection={{
          selectedRowKeys: permissions ? permissions.agencies : [],
          onChange
        }}
        rightActions={
          <Row type="flex" gutter={GUTTER_SM}>
            <Col>
              <Button onClick={() => onChange(Object.keys(agencies))} type="primary">
                {t('commons.buttons.selectAll.title')}
              </Button>
            </Col>
            <Col>
              <Button onClick={() => onChange([])}>
                {t('commons.buttons.deselectAll.title')}
              </Button>
            </Col>
          </Row>
        }
      />
    )}
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(SetPermissionsAgencies);
