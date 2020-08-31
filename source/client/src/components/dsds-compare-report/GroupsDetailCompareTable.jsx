import React, {Fragment} from 'react';
import {Card, Row} from "antd";
import {MARGIN_MD} from "../../styles/constants";
import ComponentsCompareTable from "./ComponentsCompareTable";

const GroupsDetailCompareTable = ({
                                    commonComponentsGroups
                                  }) =>
  <Fragment>
    {commonComponentsGroups && commonComponentsGroups.map((group, idx) =>
      <Card
        type="inner"
        key={idx}
        title={
          <Row type="flex" justify="center">
            {group.key}
          </Row>
        }
        style={{marginBottom: MARGIN_MD}}
      >
        <ComponentsCompareTable
          sourceComponents={(group.itemsSourceGroup || []).map(group => ({key: group}))}
          targetComponents={(group.itemsTargetGroup || []).map(group => ({key: group}))}
        />
      </Card>
    )}
  </Fragment>;

export default GroupsDetailCompareTable;