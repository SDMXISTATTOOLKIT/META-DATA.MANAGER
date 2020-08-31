import {METADATA_API_PING} from "./actions";
import axios from "axios";
import {addSpinnerAction, completeSpinnerAction} from "../spinner/actions";
import uuidv4 from "uuid";

const getMetadataApiPingUrl = baseUrl => baseUrl + (baseUrl.slice(-1) === '/' ? '' : '/') + "ping";

const metadataApiMiddleware = ({dispatch}) => next => action => {

  const result = next(action);

  if (action.type === METADATA_API_PING) {

    const uuid = uuidv4();
    dispatch(addSpinnerAction(action, uuid));

    axios.get(getMetadataApiPingUrl(action.baseUrl))
      .then(response => {
          // handle success
          dispatch({
            ...action,
            type: action.label,
            requestSuccess: response.data === true
          });
          dispatch(completeSpinnerAction(action, uuid));
        }
      )
      .catch(error => {
          // handle error
          dispatch({
            ...action,
            type: action.label,
            requestSuccess: false
          });
          dispatch(completeSpinnerAction(action, uuid));
        }
      );

  }

  return result;

};

export default metadataApiMiddleware;
