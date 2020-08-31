import {Col, Row, Spin} from "antd";
import {MARGIN_SM} from "../../../styles/constants";
import React from "react";
import {translate} from 'react-i18next';

const Footer = ({isLoading, isHidden, rowNumStart, rowNumEnd, rowCount, t}) =>
  <Row type="flex" justify="end" style={{marginTop: MARGIN_SM}}>
    <Col>
      {!isHidden
        ? (
          isLoading
            ? <Spin
              size="small"
              className="infinite-scroll-table__footer__spinner"
              style={{
                fontSize: 10,
                width: 13,
                height: 13,
                marginRight: 2
              }}
            />
            : t('components.infiniteScrollTable.footer.rowInfos', {rowNumStart, rowNumEnd, rowCount})
        )
        : <span/>
      }
    </Col>
  </Row>;

export default translate()(Footer);
