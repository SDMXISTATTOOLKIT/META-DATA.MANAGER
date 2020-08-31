import React from 'react';
import {translate} from 'react-i18next';
import {Icon} from 'antd';

const FileMappingComponentList = ({
                                    t,
                                    value,
                                    selected,
                                    onSelect,
                                    columnNameKey,
                                    cubeComponentCodeKey
                                  }) =>
  <div
    style={{
      overflow: "auto",
      height: "100%",
      border: "1px solid #e8e8e8",
      paddingLeft: 4,
      paddingRight: 4
    }}
  >
    {
      (value || []).map((value, index) =>
        <div
          key={index}
          onClick={() => onSelect ? onSelect(value) : null}
          title={onSelect
            ? t("commons.actions.select.title") + ' ' + value.columnName + ' - ' + value.cubeComponentCode
            : null
          }
          style={{
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 8,
            paddingRight: 8,
            cursor: onSelect ? "pointer" : "cursor",
            background: `${value.columnName}${value.cubeComponentCode}` === selected
              ? "#ffafa3"
              : (index % 2)
                ? "#f5f5f5"
                : "#ffffff",
            minWidth: 120
          }}
        >
          <div
            style={{
              width: "calc(50% - 24px)",
              verticalAlign: "middle",
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {value[columnNameKey]}
          </div>
          <Icon
            type="link"
            style={{
              width: 32,
              marginLeft: 8,
              marginRight: 8,
              verticalAlign: "middle",
              display: "inline-block"
            }}
          />
          <div
            style={{
              width: "calc(50% - 24px)",
              verticalAlign: "middle",
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {value[cubeComponentCodeKey]}
          </div>
        </div>
      )
    }
  </div>;

export default translate()(FileMappingComponentList);
