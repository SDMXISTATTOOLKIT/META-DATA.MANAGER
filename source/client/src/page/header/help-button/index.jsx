import React from 'react';
import {Button} from 'antd';
import EnhancedModal from '../../../components/enhanced-modal';
import {translate} from 'react-i18next';

class PageHeaderHelpButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({
      isVisible: true
    });
  }

  hide() {
    this.setState({
      isVisible: false
    });
  }

  render() {

    const { t } = this.props;

    return (
      <div>
        <Button
          onClick={this.show}
          shape="circle"
          size="small"
        >
          ?
        </Button>
        <EnhancedModal
          visible={this.state.isVisible}
          width={960}
          onCancel={this.hide}
          footer={<Button onClick={this.hide}>{t('commons.buttons.close.title')}</Button>}
        >
          <img src="./static/png/architettura.png" style={{width: '100%'}}
               alt={t('page.header.helpButton.image.alt')}/>
        </EnhancedModal>
      </div>
    );
  }
}

export default translate()(PageHeaderHelpButton);
