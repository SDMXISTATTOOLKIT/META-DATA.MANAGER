import React from 'react';
import {Empty} from 'antd';

import {translate} from 'react-i18next';

const CustomEmpty = ({className, t, text, width, backgroundColor, color, image}) =>
  <Empty
    className={className}
    description={text || t('components.empty.text')}
    image={image || <span/>}
    style={{width, margin: 0, backgroundColor, color}}
  />;

export default translate()(CustomEmpty);
