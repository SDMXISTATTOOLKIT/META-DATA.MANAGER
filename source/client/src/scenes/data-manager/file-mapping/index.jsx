import React, {Fragment} from 'react';
import FileMappingList from './list';
import FileMappingWizard from './wizard';

const FileMapping = () =>
  <Fragment>
    <FileMappingWizard/>
    <FileMappingList/>
  </Fragment>;

export default FileMapping;
