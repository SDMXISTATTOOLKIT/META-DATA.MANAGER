import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {translate} from "react-i18next";
import {Card} from 'antd';
import {isClassificationsServer} from "../../page/utils";
import {Redirect} from "react-router-dom";
import {MARGIN_MD, MARGIN_SM, PADDING_MD} from "../../styles/constants";
import {withSize} from "react-sizeme";

const HOME_PAGE_PATH = "static/homePage.html";

const mapStateToProps = state => ({
  anonymousPages: state.config.userInterface.anonymousPages,
  username: state.app.user.username,
  permissions: state.app.user.permissions
});

class Home extends Component {

  componentDidMount() {
    const iframe = document.getElementById('homePageIframeId');
    if (iframe) {
      iframe.onload = () => {
        iframe.height = (iframe.contentWindow.document.body.scrollHeight + 45) + "px";
      }
    }
  }

  componentDidUpdate() {
    const iframe = document.getElementById('homePageIframeId');
    if (iframe && iframe.contentWindow.document.body) {
      iframe.height = (iframe.contentWindow.document.body.scrollHeight + 45) + "px";
    }
  }

  render() {

    const {
      t,
      username,
      permissions,
      anonymousPages
    } = this.props;

    const currUrl = window.location;
    const baseUrl = currUrl.protocol + "//" + currUrl.host + currUrl.pathname;
    const homePage = `${baseUrl}${baseUrl.slice(-1) === '/' ? '' : '/'}${HOME_PAGE_PATH}`;

    return (
      isClassificationsServer(username, permissions, anonymousPages, t)
        ? <Redirect to={anonymousPages[0]}/>
        : (
          <Card
            className="home"
            style={{marginTop: MARGIN_MD, marginBottom: MARGIN_SM, width: "100%"}}
            bodyStyle={{padding: PADDING_MD}}
          >
            <iframe
              title={"homePageIframeTitle"}
              id={"homePageIframeId"}
              src={homePage}
              style={{border: 0, width: "100%"}}
            />
          </Card>
        )
    )
  }
}

export default compose(
  connect(mapStateToProps),
  translate(),
  withSize()
)(Home);
