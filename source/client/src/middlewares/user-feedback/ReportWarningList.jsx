import React, {Fragment} from 'react';
import {getErrorCodesTranslations} from '../../constants/getErrorCodesTranslations';
import {Alert, Card} from 'antd';

function getRow(warningKey) {
  const doubleDotsSplit = warningKey.split(':');
  const beforeDoubleDots = doubleDotsSplit.length > 0 && doubleDotsSplit[0].length > 0 ? doubleDotsSplit[0] : null;
  if (beforeDoubleDots) {
    const atSignSplit = beforeDoubleDots.split('@');
    return atSignSplit[0];
  } else {
    return null
  }
}

function getCode(warningKey) {
  const doubleDotsSplit = warningKey.split(':');
  const beforeDoubleDots = doubleDotsSplit.length > 0 && doubleDotsSplit[0].length > 0 ? doubleDotsSplit[0] : null;
  if (beforeDoubleDots) {
    const atSignSplit = beforeDoubleDots.split('@');
    return atSignSplit[1];
  } else {
    return null
  }
}

function getCol(warningKey) {
  const split = warningKey.split(':');
  return split.length > 1 && split[1].length > 0 ? split[1] : null;
}

function getTitleStr(t) {
  return t('middlewares.feedback.warningList.title');
}

function getLinePrefix(t, key) {

  const row = getRow(key);
  const code = getCode(key);
  const col = getCol(key);

  const rowStr =
    row
      ? `${t('middlewares.feedback.warningList.row')} ${row}`
      : '';

  const colStr =
    col
      ? `${t('middlewares.feedback.warningList.column')} ${col}`
      : '';

  const codeStr =
    code
      ? `${t('middlewares.feedback.warningList.code')} ${code}`
      : '';

  return [rowStr, colStr, codeStr].filter(str => str.length > 0).join(" - ") + (row || col || code ? ': ' : '');
}

function getLineContent(t, warnings, key) {
  return getErrorCodesTranslations(t)[warnings[key]] || t('errors.unknown', {code: warnings[key]});
}

export function getReportWarningListStr(t, warnings) {

  const getLine = key => `\t${getLinePrefix(t, key)}${getLineContent(t, warnings, key)}\r\n`;

  return warnings && Object.keys(warnings).length > 0
    ? `${getTitleStr(t)}\r\n\r\n${''.concat(...Object.keys(warnings)
      .map(getLine))}`
    : '';
}

export function getReportWrongLinesStr(wrongLines) {
  return wrongLines.join("\r\n");
}

const ReportWarningList = ({
                             t,
                             warnings
                           }) =>
  (warnings && Object.keys(warnings).length > 0)
    ? (
      <Card
        type="inner"
        title={getTitleStr(t)}
        bodyStyle={{
          maxHeight: 320,
          overflow: 'auto'
        }}
      >
        <Alert
          type="info"
          showIcon
          message={t('middlewares.feedback.alerts.onlyFirstErrorForRow')}
          />
        {Object.keys(warnings)
          .sort((k1, k2) => Number(getRow(k1)) - Number(getRow(k2)))
          .map((key, index) =>
            <Fragment key={index}>
              <b>{getLinePrefix(t, key)}</b> {getLineContent(t, warnings, key)}
              <br/>
            </Fragment>)}
      </Card>
    )
    : null;

export default ReportWarningList;
