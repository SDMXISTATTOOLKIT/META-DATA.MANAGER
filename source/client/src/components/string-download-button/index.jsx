import React from 'react';
import {Button} from 'antd';
import FileSaver from 'file-saver';

const StringDownloadButton = ({
                                str,
                                fileName,
                                mimeType,
                                children
                              }) =>
  <Button
    icon="download"
    onClick={
      () =>
        FileSaver.saveAs(
          new File(
            [str],
            fileName,
            {type: `${mimeType};charset=utf-8`}
          )
        )
    }
  >
    {children}
  </Button>;

export default StringDownloadButton;
