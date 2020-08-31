import React, {Fragment} from 'react';
import {Icon, Tree} from "antd"
import {MARGIN_SM} from "../../styles/constants";
import {getNormalizedColumnName} from "../../utils/normalizers";

const DraggableCheckList = ({
                              items,
                              getItemLabel,
                              getItemIcon,
                              getItemKey,
                              checkedKeys,
                              onCheck,
                              onDrop
                            }) =>
  <Fragment>
    <Tree
      draggable
      checkable
      selectable={false}
      showIcon
      checkedKeys={checkedKeys}
      onCheck={onCheck}
      onDrop={onDrop}
    >
      {
        items && items.map(item =>
          <Tree.TreeNode
            key={getItemKey(item)}
            title={
              <Fragment>
                <Icon type={getItemIcon(item)} style={{marginRight: MARGIN_SM}}/>
                {getItemLabel(getNormalizedColumnName(item))}
              </Fragment>
            }
            icon={<Icon type="ellipsis" style={{transform: "translate(0px, -2px) rotate(90deg)"}}/>}
          />
        )
      }
    </Tree>
  </Fragment>;

export default DraggableCheckList;