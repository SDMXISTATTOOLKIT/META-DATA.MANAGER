import {Col, Row} from "antd";
import {GUTTER_MD, GUTTER_SM, MARGIN_MD, SPAN_FULL} from "../../../styles/constants";
import SearchInput from "../../search-input";
import React from "react";
import {translate} from 'react-i18next';
import AutoSearchInput from "../../auto-search-input";

const PreHeader = ({
                     t,
                     searchText,
                     autoSearch,
                     onSearch,
                     selectedRowCount,
                     tableActions,
                     renderTableAction,
                     leftActions,
                     rightActions,
                     searchBarSpan
                   }) => {
  return <Row type="flex" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}} align="middle">
    <Col span={searchBarSpan}>
      {(() => {
        const SearchComponent = autoSearch ? AutoSearchInput : SearchInput;
        return (
          <SearchComponent
            placeholder={t('components.infiniteScrollTable.search.placeholder')}
            value={searchText}
            onSearch={onSearch}
          />
        );
      })()}
    </Col>
    <Col span={SPAN_FULL - searchBarSpan}>
      <Row type="flex" justify="space-between" align="middle" gutter={GUTTER_MD}>
        <Col>{leftActions}</Col>
        <Col>
          <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
            {tableActions && selectedRowCount > 0 && (
              <Col>
                <Row type="flex" justify="end" align="middle" gutter={GUTTER_SM}>
                  <Col>
                    {t('components.infiniteScroll.header.selectedRowCount', {
                      selectedRowCount
                    })}
                  </Col>
                  {tableActions.map((action, index) =>
                    <Col key={index}>{renderTableAction(action)}</Col>
                  )}
                </Row>
              </Col>
            )}
            {rightActions && <Col>{rightActions}</Col>}
          </Row>
        </Col>
      </Row>
    </Col>
  </Row>;
};

export default translate()(PreHeader);
