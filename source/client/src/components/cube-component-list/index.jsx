import React, {Fragment} from 'react';
import {translate} from 'react-i18next';

import {getArtefactTripletFromUrn} from '../../utils/sdmxJson';
import CubeComponentListItem from './item';
import {Modal} from "antd";

/* Based on https://ant.design/components/form/#components-form-demo-customized-form-controls */
class CubeComponentList extends React.Component {

  constructor(props) {
    super(props);
    this.state = CubeComponentList.getInitState();
    this.callOnChange = this.callOnChange.bind(this);
    this.setChecked = this.setChecked.bind(this);
  }

  static getInitState() {
    return {
      value: {
        dimensions: [],
        timeDimensions: [],
        tidAttributes: [],
        attributes: [],
        measures: []
      }
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return nextProps.value !== null
      ? {value: nextProps.value}
      : CubeComponentList.getInitState();
  }

  callOnChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  setChecked(componentsListKey, code, checked, uncheckableDims, t) {

    if ((uncheckableDims || []).includes(code)) {
      Modal.warning({
        title: t('components.cubeComponentList.modals.uncheckableDim.title')
      });

    } else {
      const value = {
        ...this.state.value,
        [componentsListKey]: this.state.value[componentsListKey].map(comp =>
          comp.Code === code
            ? ({
              ...comp,
              checked: checked
            })
            : comp
        )
      };
      this.setState({value});
      this.callOnChange(value);
    }
  }

  render() {

    const {
      t,
      onCodelistShow,
      onAttributeShow,
      onDimensionShow,
      onMeasureShow,
      disabled,
      labelKey,
      checkboxDisabled,
      uncheckableDims
    } = this.props;

    const {
      dimensions,
      timeDimensions,
      tidAttributes,
      attributes,
      measures
    } = this.state.value;

    return (
      <Fragment>
        {dimensions
          .map(dim =>
            <CubeComponentListItem
              key={dim.Code}
              icon="bar-chart"
              label={dim[labelKey || 'Code']}
              isChecked={dim.checked}
              hasCheckbox={!disabled}
              disabled={dim.disabled || checkboxDisabled}
              onChange={e => this.setChecked('dimensions', dim.Code, e.target.checked, uncheckableDims, t)}
              onDetail={onDimensionShow ? () => onDimensionShow(dim.Code) : null}
              onCodelistShow={
                onCodelistShow
                  ? (
                    (dim.localRepresentation && dim.localRepresentation.enumeration)
                      ? () => onCodelistShow(getArtefactTripletFromUrn(dim.localRepresentation.enumeration))
                      : null
                  )
                  : undefined
              }
            />)
        }
        {timeDimensions
          .map(dim =>
            <CubeComponentListItem
              key={dim.Code}
              icon="clock-circle"
              label={dim[labelKey || 'Code']}
              disabled={dim.disabled || checkboxDisabled}
              isChecked={dim.checked}
              onDetail={onDimensionShow ? () => onDimensionShow(dim.Code) : null}
              onChange={e => this.setChecked('timeDimensions', dim.Code, e.target.checked, uncheckableDims, t)}
              hasCheckbox={!disabled}
            />)
        }
        {tidAttributes
          .map(attr =>
            <CubeComponentListItem
              key={attr.Code}
              icon="flag"
              disabled={attr.disabled || checkboxDisabled}
              label={attr[labelKey || 'Code']}
              isChecked={attr.checked}
              onChange={e => this.setChecked('tidAttributes', attr.Code, e.target.checked, uncheckableDims, t)}
              hasCheckbox={!disabled}
              onAttributeShow={null}
            />)
        }
        {attributes
          .map(attr =>
            <CubeComponentListItem
              key={attr.Code}
              icon="profile"
              label={attr[labelKey || 'Code']}
              disabled={attr.disabled || checkboxDisabled}
              isChecked={attr.checked}
              onChange={e => this.setChecked('attributes', attr.Code, e.target.checked, uncheckableDims, t)}
              hasCheckbox={!disabled}
              onDetail={onAttributeShow ? () => onAttributeShow(attr.Code) : null}
              onCodelistShow={
                onCodelistShow
                  ? (
                    (attr.localRepresentation && attr.localRepresentation.enumeration)
                      ? () => onCodelistShow(getArtefactTripletFromUrn(attr.localRepresentation.enumeration))
                      : null
                  )
                  : undefined
              }
              isMandatory={attr.IsMandatory || (attr.assignmentStatus || "").toLowerCase() === "mandatory"}
            />)
        }
        {measures
          .map(meas =>
            <CubeComponentListItem
              key={meas.Code}
              icon="line-chart"
              label={meas[labelKey || 'Code']}
              disabled={meas.disabled || checkboxDisabled}
              isChecked={meas.checked}
              onChange={e => this.setChecked('measures', meas.Code, e.target.checked, uncheckableDims, t)}
              hasCheckbox={!disabled}
              onDetail={onMeasureShow ? () => onMeasureShow() : null}
              onCodelistShow={
                onCodelistShow
                  ? (
                    (meas.localRepresentation && meas.localRepresentation.enumeration)
                      ? () => onCodelistShow(getArtefactTripletFromUrn(meas.localRepresentation.enumeration))
                      : null
                  )
                  : undefined
              }
            />)
        }
      </Fragment>
    );
  }
}

export default translate()(CubeComponentList);
