import React from 'react';
import {translate} from 'react-i18next';
import {Icon} from 'antd';
import {COLOR_FONT_DISABLED} from '../../../../../styles/constants';

const IconFontCNIcon = Icon.createFromIconfontCN({
  scriptUrl: './static/vendor/iconfont_cn/iconfont.js',
});

const FileMappingWizardComponentList = ({
                                          t,
                                          components,
                                          disabled,
                                          hasIcon,
                                          selected,
                                          onSelect
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
      (components || []).map((component, index) =>
        <div
          key={index}
          onClick={() => !disabled.includes(component.name) && onSelect(component)}
          title={t("commons.actions.select.title") + ' ' + component.name}
          className={disabled.includes(component.name)
            ? "ant-select-disabled"
            : ""
          }
          style={{
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 8,
            paddingRight: 4,
            background: component.name === selected
              ? "#ffafa3"
              : (index % 2)
                ? "#f5f5f5"
                : "#ffffff",
            borderTop: "1px solid #e8e8e8",
            cursor: 'pointer',
            minWidth: 120
          }}
        >
          {
            hasIcon
              ? (
                <Icon
                  type={component.icon}
                  style={{
                    width: 16,
                    marginRight: 8,
                    verticalAlign: "middle",
                    display: "inline-block",
                    color: disabled.filter(el => el === component.name).length > 0 ? COLOR_FONT_DISABLED : undefined,
                  }}
                />
              )
              : null
          }
          <div
            style={{
              width: hasIcon ? "calc(100% - 56px)" : "calc(100% - 32px)",
              verticalAlign: "middle",
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: disabled.filter(el => el === component.name).length > 0 ? COLOR_FONT_DISABLED : undefined,
              fontWeight: !disabled.filter(el => el === component.name).length > 0 ? "bold" : undefined,
            }}
          >
            {
              component.IsMandatory
                ? <IconFontCNIcon type="m" style={{marginRight: 4}} title="Mandatory"/>
                : null
            }
            {component.name}
          </div>
          <Icon
            title={component.detailTitle}
            style={{
              width: 16,
              marginLeft: 8,
              verticalAlign: "middle",
              display: "inline-block",
              cursor: component.onDetail !== null ? 'pointer' : 'not-allowed',
              color: component.onDetail === null ? COLOR_FONT_DISABLED : null
            }}
            onClick={
              component.onDetail !== null
                ? (
                  e => {
                    e.stopPropagation();
                    component.onDetail(component);
                  }
                )
                : null
            }
            type="file-search"
          />
        </div>
      )
    }
  </div>;

export default translate()(FileMappingWizardComponentList);
