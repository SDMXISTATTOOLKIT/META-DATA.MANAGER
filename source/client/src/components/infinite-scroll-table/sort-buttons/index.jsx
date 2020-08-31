import React, {Fragment} from 'react';

import {Icon} from 'antd';

import "./style.css";

export const SORT_DIRECTION_ASC = 'SORT_DIRECTION_ASC';
export const SORT_DIRECTION_DESC = 'SORT_DIRECTION_DESC';

const SortButtons = ({
                       value,
                       onChange
                     }) =>
  <Fragment>
    <div className="infinite-scroll-table__header__sort-buttons__icon-container">
      <Icon
        className={`infinite-scroll-table__header__icon ${value === SORT_DIRECTION_ASC ? "infinite-scroll-table__header__icon--active" : ""}`}
        type="caret-up"
        onClick={() => onChange(value !== SORT_DIRECTION_ASC ? SORT_DIRECTION_ASC : null)}
      />
    </div>
    <div className="infinite-scroll-table__header__sort-buttons__icon-container">
      <Icon
        className={`infinite-scroll-table__header__icon ${value === SORT_DIRECTION_DESC ? "infinite-scroll-table__header__icon--active" : ""}`}
        type="caret-down"
        onClick={() => onChange(value !== SORT_DIRECTION_DESC ? SORT_DIRECTION_DESC : null)}
      />
    </div>
  </Fragment>;

export default SortButtons;
