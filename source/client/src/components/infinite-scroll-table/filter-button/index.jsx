import React from 'react';
import {Checkbox, Dropdown, Icon, Menu} from 'antd';
import "./style.css";
import SearchInput from "../../search-input";

const FilterButton = ({
                        value,
                        onChange,
                        options
                      }) =>
  <Dropdown
    trigger={['click']}
    overlay={
      <Menu
        className={options ? "infinite-scroll-table__header__filter-button__options-container" : null}
        style={{width: '100%'}}
      >
        {options && options.length
          ? (
            options.map((option, index) =>
              <Menu.Item
                className="infinite-scroll-table__header__filter-button__option"
                key={index}
                disabled
                style={{cursor: "auto"}}
              >
                <Checkbox
                  style={{marginRight: 8}}
                  checked={(value || []).find(val => val === option.value) !== undefined}
                  onChange={
                    ({target}) =>
                      target.checked
                        ? onChange([...(value || []), option.value])
                        : onChange((value || []).filter(val => val !== option.value))
                  }
                />
                {option.text}
              </Menu.Item>
            )
          )
          : (
            <Menu.Item disabled style={{cursor: "auto"}}>
              <SearchInput onSearch={onChange} value={value}/>
            </Menu.Item>
          )
        }
      </Menu>
    }>
    <div className="infinite-scroll-table__header__filter-button__icon-container">
      <Icon
        className={`infinite-scroll-table__header__icon ${value ? "infinite-scroll-table__header__icon--active" : ""}`}
        type="filter"
        theme="filled"
      />
    </div>
  </Dropdown>;

export default FilterButton;
