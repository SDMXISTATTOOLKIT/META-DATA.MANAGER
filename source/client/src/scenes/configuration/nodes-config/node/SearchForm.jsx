import React, {Fragment} from 'react';
import {translate} from 'react-i18next';
import InputListForm from "../../../../components/input-list-form";
import {Form} from "antd";

const SearchForm = ({
                      t,
                      Search,
                      onChange
                    }) =>
  <Fragment>
    <Form.Item
      label={t('data.nodesConfig.search.excludeCodelists.label')}
    >
      <InputListForm
        values={Search.ExcludeCodelists || []}
        onChange={arr => onChange({ExcludeCodelists: arr})}
        addItemLabel={t('scenes.configuration.nodesConfig.search.excludeCodelists.addButton.title')}
        removeItemLabel={t('scenes.configuration.nodesConfig.search.excludeCodelists.removeButton.title')}
      />
    </Form.Item>
    <Form.Item
      label={t('data.nodesConfig.search.excludeConceptSchemes.label')}
    >
      <InputListForm
        values={Search.ExcludeConceptSchemes || []}
        onChange={arr => onChange({ExcludeConceptSchemes: arr})}
        addItemLabel={t('scenes.configuration.nodesConfig.search.excludeConceptSchemes.addButton.title')}
        removeItemLabel={t('scenes.configuration.nodesConfig.search.excludeConceptSchemes.removeButton.title')}
      />
    </Form.Item>
  </Fragment>;

export default translate()(SearchForm);
