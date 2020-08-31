import React from 'react';
import Selector from '../selector';
import {Button, Card, Col, Form, Row} from 'antd';
import './style.css';
import Call from '../../hocs/call';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {getLocalizedStr} from '../../middlewares/i18n/utils';
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from '../../utils/tree';
import {DCS_ORDERED_TREE_ROOT} from '../../utils/treeBuilders';
import EnhancedTree from '../enhanced-tree';
import CubeComponentList from '../../components/cube-component-list';
import {MARGIN_MD, MODAL_WIDTH_MD, SPAN_FULL, SPAN_HALF} from '../../styles/constants';
import EnhancedModal from '../../components/enhanced-modal';
import _ from "lodash";

const mapPropsToFields = ({
                            appLanguage,
                            dataLanguages,
                            dataLanguage,
                            cube
                          }) => ({
  cubeId: Form.createFormField({
    value:
      cube !== null
        ? `[${cube.Code}] ${getLocalizedStr(cube.labels, dataLanguage || appLanguage, dataLanguages)}`
        : null
  }),
  cubeColumns: Form.createFormField({value: cube !== null ? cube.columns : null})
});

const onFieldsChange = (props, fields) => props.onColumnsChange(fields);

const QueryColumnsForm = ({
                            t,
                            form,
                            appLanguage,
                            dataLanguages,
                            categorisedCubes,
                            ddbDataflowId,
                            ddbDataflow,
                            cubeId,
                            cube,
                            cubeFirstRow,
                            isCubeTreeVisible,
                            onCubeTreeShow,
                            onCubeTreeHide,
                            onCubeSet,
                            onCubeUnset,
                            fetchDdbDataflow,
                            fetchCube,
                            fetchCubeFirstRow,
                            fetchCategorisedCubes,
                            disabled,
                            uncheckableDims
                          }) =>
  <Form>
    <Call cb={fetchDdbDataflow} cbParam={ddbDataflowId} disabled={ddbDataflowId === null}>
      <Call
        cb={fetchCube}
        cbParam={cubeId}
        disabled={(ddbDataflowId !== null && ddbDataflow === null) || cubeId === null}
      >
        <Call
          cb={fetchCubeFirstRow}
          cbParam={{
            cubeId: cubeId,
            cubeColumns: cube !== null
              ? _.flatten(
                Object.keys(cube.columns)
                  .map(key => cube.columns[key])
              )
                .map(col => col.name)
              : null,
          }}
          disabled={cubeId === null || cube === null}
        >
          <Row type="flex">
            <Col span={SPAN_FULL}>
              <EnhancedModal
                visible={isCubeTreeVisible}
                title={t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.cubeTreeModal.title')}
                footer={<Button onClick={onCubeTreeHide}>{t('commons.buttons.close.title')}</Button>}
                onCancel={onCubeTreeHide}
                withDataLanguageSelector
                width={MODAL_WIDTH_MD}
              >
                <Call cb={fetchCategorisedCubes} disabled={categorisedCubes !== null}>
                  <div className="query__cube-columns-form__tree">
                    <EnhancedTree
                      tree={categorisedCubes}
                      idKey="Code"
                      childrenKey="children"
                      nameKey="labels"
                      catIdKey="CatCode"
                      catNameKey="labels"
                      unselectableKeys={getNodes(categorisedCubes, 'children', node => node.children)
                        .map(node => node.CatCode)}
                      hiddenIdKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
                      getFilter={
                        searchText =>
                          ({Code, CatCode, labels}) => {
                            const search = searchText.toLowerCase();
                            return (Code && Code.toLowerCase()
                                .indexOf(search) >= 0) ||
                              (CatCode && CatCode.toLowerCase()
                                .indexOf(search) >= 0) ||
                              getLocalizedStr(labels, appLanguage, dataLanguages)
                                .toLowerCase()
                                .indexOf(search) >= 0;
                          }
                      }
                      onSelect={
                        selectedArr => {
                          const node = getNode(
                            categorisedCubes,
                            'children',
                            node => node.children
                              ? node.CatCode === selectedArr[0]
                              : node.Code === selectedArr[0]
                          );
                          if (node !== null && node.children === undefined) {
                            onCubeSet(node.IDCube);
                          } else {
                            onCubeUnset();
                          }
                        }
                      }
                      treeActions={[
                        {
                          title: t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.cubeTreeModal.tree.refreshButton.title'),
                          icon: 'sync',
                          onClick: fetchCategorisedCubes
                        }
                      ]}
                      icon="cube"
                      isCustomIcon
                      getIconColor={() => "#37a0f4"}
                      searchBarSpan={SPAN_HALF}
                    />
                  </div>
                </Call>
              </EnhancedModal>
              <Form.Item className="form-item-required">
                {form.getFieldDecorator('cubeId')(
                  <Selector
                    selectTitle={t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.fields.cube.selectIcon.title')}
                    resetTitle={t('scenes.dataManager.dataflowBuilder.wizard.query.columnsForm.fields.cube.resetIcon.title')}
                    onSelect={onCubeTreeShow}
                    onReset={onCubeUnset}
                    onDetail={null}
                    disabled={disabled}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {cube !== null && cubeFirstRow !== null && cubeFirstRow !== undefined && (
            <Row type="flex" style={{marginTop: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item>
                  <Card
                    type="inner"
                    bodyStyle={{
                      height: 391,
                      overflow: 'auto'
                    }}
                  >
                    {form.getFieldDecorator('cubeColumns')(
                      <CubeComponentList
                        uncheckableDims={uncheckableDims}
                        labelKey="ColName"
                        checkboxDisabled={disabled}
                      />
                    )}
                  </Card>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Call>
      </Call>
    </Call>
  </Form>;

export default compose(
  translate(),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(QueryColumnsForm);
