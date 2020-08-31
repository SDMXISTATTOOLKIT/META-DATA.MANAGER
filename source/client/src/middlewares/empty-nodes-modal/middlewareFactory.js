import {REQUEST_SUCCESS} from '../api/actions';
import {CONFIG_READ} from "../../reducers/config/actions";
import {Modal} from "antd";
import React, {Fragment} from 'react';
import {PATH_NODES_CONFIGURATION} from "../../constants/paths";

const emptyNodesModalMiddlewareFactory = i18next => () => next => action => {

  const result = next(action);

  const t = i18next.t.bind(i18next);

  if (action.type === REQUEST_SUCCESS && action.label === CONFIG_READ && action.response.nodes.length === 0) {

    if (window.modal !== undefined) {
      window.modal.destroy();
    }

    window.modal = Modal.warning({
      title: t('middlewares.emptyNodesModal.title'),
      content:
        <Fragment>
          {`${t('middlewares.emptyNodesModal.content.text')} `}
          <a
            href={`./#${PATH_NODES_CONFIGURATION}`}
            onClick={() => window.modal.destroy()}
            style={{textDecoration: "underline"}}
          >
            {t('middlewares.emptyNodesModal.content.nodesConfigLink')}
          </a>
        </Fragment>,
      onOk() {
        window.open('./#', '_self');
      },
      okText: t('commons.buttons.goHome.label')
    });
  }

  return result;
};

export default emptyNodesModalMiddlewareFactory;
