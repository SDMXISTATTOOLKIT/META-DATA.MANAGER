import React, {Component, Fragment} from 'react';
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Col, Modal, Row} from 'antd';
import DataLanguageSelector from "../data-language-selector";
import uuidv4 from 'uuid';
import {
  MARGIN_SM,
  MARGIN_XL,
  MODAL_HEIGHT_MD,
  MODAL_HEIGHT_XS,
  MODAL_WIDTH_SM,
  Z_INDEX_ENHANCED_MODAL
} from '../../styles/constants';
import _ from 'lodash';
import {DataLanguageConsumer, DataLanguageProvider} from "../../contexts/DataLanguage";
import "./style.css"

const ANT_MODAL_CONTENT_SELECTOR = '.ant-modal-content';
const ANT_MODAL_HEADER_SELECTOR = '.ant-modal-header';
const ANT_MODAL_BODY_SELECTOR = '.ant-modal-body';
const ANT_MODAL_FOOTER_SELECTOR = '.ant-modal-footer';

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const $ = window.jQuery;

class EnhancedModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      className: uuidv4(),
      dragAndResizeEnabled: false,
      language: null,
      oldVisible: null,
      modalInitialDimensions: null,
      modalBodyInitialHeight: null
    };

    this.revertInitialPosAndDim = this.revertInitialPosAndDim.bind(this);
  }

  static getDerivedStateFromProps(props, state) {

    return ({
      oldVisible: props.visible,
      language: (props.visible && !state.oldVisible) ? null : state.language
    })
  }

  componentDidMount() {
    $(window).resize((e) => {
      if (e.target === window) {
        const modal = $(`.${this.state.className} ${ANT_MODAL_CONTENT_SELECTOR}`);
        if (modal) {
          modal.css({top: 0, left: 0}); // reset modal position (centered)
        }
      }
    });
  }

  componentDidUpdate() {

    if (!this.state.dragAndResizeEnabled) {

      this.setState({dragAndResizeEnabled: true});

      let modal = $(`.${this.state.className} ${ANT_MODAL_CONTENT_SELECTOR}`);

      if (modal.length > 0) {

        let modalHeader = modal.find(ANT_MODAL_HEADER_SELECTOR);
        let modalBody = modal.find(ANT_MODAL_BODY_SELECTOR);
        let modalFooter = modal.find(ANT_MODAL_FOOTER_SELECTOR);

        modal
          .draggable({
            handle: `${ANT_MODAL_HEADER_SELECTOR}, ${ANT_MODAL_FOOTER_SELECTOR}`,
            // containment: 'document',
            scroll: false
          })
          .resizable({
            minWidth: MODAL_WIDTH_SM,
            minHeight: MODAL_HEIGHT_XS,
            maxHeight: MODAL_HEIGHT_MD + modalFooter.outerHeight() + modalHeader.outerHeight(),
            handles: 'n, e, s, w, ne, se, sw, nw',
            resize: (_, {originalSize, size}) => {

              let modalBodyHeight =
                modal.outerHeight() -
                modalHeader.outerHeight() -
                (modalFooter.outerHeight() || 0) -
                (modalBody.outerHeight() - modalBody.height());

              if (originalSize.height !== size.height) {
                modalBody.height(modalBodyHeight);
              }

              if (!this.state.modalInitialDimensions) {
                this.setState({
                  modalInitialDimensions: {
                    width: originalSize.width,
                    height: originalSize.height
                  },
                  modalBodyInitialHeight:
                    originalSize.height -
                    modalHeader.outerHeight() -
                    (modalFooter.outerHeight() || 0) -
                    (modalBody.outerHeight() - modalBody.height())
                });
              }
            }
          });

        const resetter = $(`
          <div style='
            background: #ccc8; 
            color: #fffc; 
            text-align: center; 
            border-bottom-left-radius: 8px; 
            border-bottom-right-radius: 8px; 
            width: 200px; 
            left: 50%;
            margin-left: -100px; 
            position: absolute; 
            z-index: 100000; 
            cursor: pointer'
          > 
            ${this.props.t("components.enhancedModal.resetter.title")} 
          </div>
        `);

        let _this = this;
        resetter.click(function (e) {
          return e.target === this
            ? _this.revertInitialPosAndDim() :
            null
        });

        modal
          .parent()
          .parent()
          // .css("overflow", "hidden")
          .prepend(resetter);
      }
    }
  }

  revertInitialPosAndDim() {
    let modal = $(`.${this.state.className} ${ANT_MODAL_CONTENT_SELECTOR}`);

    if (this.state.modalInitialDimensions && this.state.modalBodyInitialHeight !== null) {
      modal.width(this.state.modalInitialDimensions.width);
      modal.height(this.state.modalInitialDimensions.height);

      let modalBody = modal.find(ANT_MODAL_BODY_SELECTOR);
      modalBody.height(this.state.modalBodyInitialHeight);
    }

    modal.css({top: 0, left: 0})
  }

  render() {
    return (
      <DataLanguageConsumer>
        {parentDataLanguage => {

          const dataLanguage =
            this.state.language ||
            parentDataLanguage ||
            (_.find(this.props.dataLanguages, ({code}) => code === this.props.appLanguage) || {}).code ||
            'en';

          return (
            <Modal
              {...this.props}
              className={this.state.className}
              bodyStyle={{
                overflow: 'auto',
                maxHeight: MODAL_HEIGHT_MD,
                ...this.props.bodyStyle
              }}
              forceRender
              destroyOnClose={false}
              maskClosable={false}
              afterClose={this.revertInitialPosAndDim}
              title={
                <Row type="flex" justify="space-between" style={{marginRight: MARGIN_XL + MARGIN_SM}}>
                  <Col>
                    {this.props.title}
                  </Col>
                  {this.props.withDataLanguageSelector && (
                    <Col style={{fontWeight: 'initial'}}>
                      <DataLanguageSelector
                        value={dataLanguage}
                        size="small"
                        onSelect={
                          selected => {
                            if (this.props.onDataLanguageSelectorChange) {
                              this.props.onDataLanguageSelectorChange(selected, () => this.setState({language: selected}));
                            } else {
                              this.setState({language: selected});
                            }
                          }
                        }
                      />
                    </Col>
                  )}
                </Row>
              }
              footer={
                this.props.footer
                  ? (
                    this.props.withDataLanguageSelector
                      ? (
                        <DataLanguageProvider value={dataLanguage}>
                          {this.props.footer}
                        </DataLanguageProvider>
                      )
                      : this.props.footer
                  )
                  : <Fragment/>
              }
              zIndex={Z_INDEX_ENHANCED_MODAL}
            >
              {this.props.visible && (
                this.props.withDataLanguageSelector
                  ? (
                    <DataLanguageProvider value={dataLanguage}>
                      {this.props.children}
                    </DataLanguageProvider>
                  )
                  : this.props.children
              )}
            </Modal>
          );
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(EnhancedModal);
