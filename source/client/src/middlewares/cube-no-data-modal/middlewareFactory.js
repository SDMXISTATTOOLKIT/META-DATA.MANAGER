import {REQUEST_SUCCESS} from "../api/actions";
import {Modal} from "antd";
import {DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ} from "../../scenes/data-manager/dataflow-builder/wizard/query/actions";

const cubeNoDataModalMiddlewareFactory = i18next => () => next => action => {

  const result = next(action);

  const t = i18next.t.bind(i18next);

  if (
    action.type === REQUEST_SUCCESS &&
    action.label === DATAFLOW_BUILDER_WIZARD_QUERY_CUBE_COLUMNS_FORM_CUBE_FIRST_ROW_READ &&
    action.response.Data[0] === undefined
  ) {
    Modal.error({
      content: (action.response.CountEmbargo && action.response.CountEmbargo > 0)
        ? t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.cubeTreeModal.cubeOnlyEmbargoedDataModal.content')
        : t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.cubeTreeModal.cubeNoDataModal.content'),
    })
  }

  return result;
};

export default cubeNoDataModalMiddlewareFactory;
