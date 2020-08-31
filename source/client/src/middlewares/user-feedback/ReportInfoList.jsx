import {Card} from 'antd';
import {getErrorCodesTranslations} from '../../constants/getErrorCodesTranslations';
import React, {Fragment} from 'react';

function getTitle(t) {
  return t('middlewares.feedback.infoList.title');
}

function getLinePrefix(t, key) {
  return `${getErrorCodesTranslations(t)[key] || t('errors.unknown', {code: key})}: `;
}

function getLineContent(infos, key) {
  return infos[key];
}

export function getReportInfoListStr(t, infos) {

  const getLine = key => `\t${getLinePrefix(t, key)}${getLineContent(infos, key)}\r\n`;

  return infos && Object.keys(infos).length > 0
    ? `${getTitle(t)}\r\n\r\n${''.concat(...Object.keys(infos)
      .map(getLine))}`
    : '';
}

export const ReportInfoList = ({
                                 t,
                                 infos
                               }) =>
  infos && Object.keys(infos).length > 0 && (
    <Card
      type="inner"
      title={getTitle(t)}
      bodyStyle={{
        maxHeight: 160,
        overflow: 'auto'
      }}
    >
      {Object.keys(infos)
        .map((key, index) =>
          <Fragment key={index}>
            <b>{getLinePrefix(t, key)}</b> {getLineContent(infos, key)}<br/>
          </Fragment>)
      }
    </Card>
  );
