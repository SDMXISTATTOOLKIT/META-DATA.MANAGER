import React from 'react';
import {connect} from "react-redux";
import {DatePicker} from "antd";
import itIT from "antd/lib/date-picker/locale/it_IT";
import moment from "moment"

const mapStateToProps = state => ({
  appLanguage: state.app.language
});

const LocalizedDatePicker = ({
                               appLanguage,
                               value,
                               format = "YYYY-MM-DD",
                               returnParsedDate,
                               onChange,
                               ...props
                             }) => {

  return (
    <div
      title={value ? moment(value).format(format) : null}
    >
      <DatePicker
        {...props}
        style={{width: "100%", ...props["style"]}}
        value={value ? moment(value) : null}
        locale={appLanguage === 'it' ? itIT : null}
        format={format}
        onChange={date => onChange(date
          ? returnParsedDate
            ? moment(date).format(format)
            : date
          : null
        )}
      />
    </div>
  )
};

export default connect(mapStateToProps)(LocalizedDatePicker);
