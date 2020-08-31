import {translate} from 'react-i18next';
import {Checkbox, Icon} from 'antd';
import {COLOR_FONT_DISABLED, MARGIN_SM} from '../../../styles/constants';
import React from 'react';
import {getNormalizedColumnName} from "../../../utils/normalizers";

const IconFontCNIcons = Icon.createFromIconfontCN({
  scriptUrl: './static/vendor/iconfont_cn/iconfont.js',
});

const mandatoryIconStyle = {
  type: 'm',
  title: "Mandatory"
};

const CubeComponentListItem = ({
                                 t,
                                 disabled,
                                 isChecked,
                                 hasCheckbox,
                                 label,
                                 icon,
                                 isMandatory,
                                 onChange,
                                 onCodelistShow,
                                 onDetail
                               }) =>
  <div
    style={{
      width: "100%",
      minWidth: 100,
      marginBottom: MARGIN_SM
    }}
  >
    <div
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        width: onCodelistShow !== undefined ? "calc(100% - 22px)" : "100%"
      }}
    >
      {hasCheckbox && (
        <div
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: 16,
            marginLeft: 0,
            marginRight: 16
          }}
        >
          <Checkbox
            checked={isChecked}
            disabled={disabled}
            onChange={onChange}
          />
        </div>
      )}
      <div
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: 14,
          marginLeft: 0,
          marginRight: 8
        }}
      >
        <Icon type={icon}/>
      </div>
      {isMandatory && (
        <div
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: 14,
            marginLeft: 0,
            marginRight: 4
          }}
        >
          <IconFontCNIcons style={{marginTop: 3}} {...mandatoryIconStyle}/>
        </div>
      )}
      <div
        onClick={onDetail}
        title={onDetail ? t('components.cubeComponentList.item.detailShow.title') : label}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: `calc((100% - 22px)${isMandatory ? ' - 18px' : ''}${hasCheckbox ? ' - 32px' : ''})`,
          cursor: onDetail ? 'pointer' : null,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {getNormalizedColumnName(label)}
      </div>
    </div>
    {onCodelistShow !== undefined && (
      <div
        style={{
          width: 14,
          display: "inline-block",
          verticalAlign: "middle",
          marginLeft: 8,
          marginRight: 0
        }}
      >
        <Icon
          type="file-search"
          onClick={onCodelistShow}
          style={{
            cursor: onCodelistShow ? 'pointer' : null,
            color: !onCodelistShow ? COLOR_FONT_DISABLED : null
          }}
          title={t('components.cubeComponentList.item.codelistShowIcon.title')}
        />
      </div>
    )}
  </div>;

export default translate()(CubeComponentListItem);
