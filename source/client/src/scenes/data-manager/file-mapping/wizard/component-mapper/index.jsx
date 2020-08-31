import {Button, Col, Row} from 'antd';
import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {GUTTER_SM, MARGIN_MD} from '../../../../../styles/constants';
import {
  addAllFileMappingWizardComponentMapperComponent,
  addFileMappingWizardComponentMapperComponent,
  removeAllFileMappingWizardComponentMapperComponent,
  removeFileMappingWizardComponentMapperComponent,
  selectFileMappingWizardComponentMapperComponent
} from './actions';
import FileMappingComponentList from '../../../../../components/file-mapping-component-list';

const mapStateToProps = state => ({
  components: state.scenes.dataManager.fileMapping.components.wizard.shared.components,
  selectedColumnName: state.scenes.dataManager.fileMapping.components.wizard.shared.selectedColumnName,
  selectedCubeComponentCode: state.scenes.dataManager.fileMapping.components.wizard.shared.selectedCubeComponentCode,
  selectedComponent: state.scenes.dataManager.fileMapping.components.wizard.shared.selectedComponent,
  csvHeader: state.scenes.dataManager.fileMapping.components.wizard.shared.csvHeader,
  cube: state.scenes.dataManager.fileMapping.components.wizard.shared.cube,
});

const mapDispatchToProps = dispatch => ({
  onComponentAdd: (columnName, cubeComponentCode) =>
    dispatch(addFileMappingWizardComponentMapperComponent(columnName, cubeComponentCode)),
  onComponentAddAll: () =>
    dispatch(addAllFileMappingWizardComponentMapperComponent()),
  onComponentRemove: (columnName, cubeComponentCode) =>
    dispatch(removeFileMappingWizardComponentMapperComponent(columnName, cubeComponentCode)),
  onComponentRemoveAll: () =>
    dispatch(removeAllFileMappingWizardComponentMapperComponent()),
  onComponentSelect: (columnName, cubeComponentCode) =>
    dispatch(selectFileMappingWizardComponentMapperComponent(columnName, cubeComponentCode))
});

const FileMappingWizardComponentMapper = ({
                                            t,
                                            components,
                                            csvHeader,
                                            cube,
                                            selectedColumnName,
                                            selectedCubeComponentCode,
                                            selectedComponent,
                                            onComponentAdd,
                                            onComponentAddAll,
                                            onComponentRemove,
                                            onComponentRemoveAll,
                                            onComponentSelect,
                                          }) =>
  <Fragment>
    <Row type="flex" justify="space-between" style={{ marginBottom: MARGIN_MD }}>
      <Col>
        <Row type="flex" gutter={GUTTER_SM}>
          <Col>
            <Button
              onClick={() => onComponentAdd(selectedColumnName, selectedCubeComponentCode)}
              disabled={selectedColumnName === null || selectedCubeComponentCode === null}
              title={t('scenes.dataManager.fileMapping.wizard.componentMapper.componentAddButton.title')}
              icon="plus"
            />
          </Col>
          <Col>
            <Button
              onClick={() => onComponentAddAll()}
              disabled={csvHeader === null || cube === null}
              title={t('scenes.dataManager.fileMapping.wizard.componentMapper.componentAddAllButton.title')}
              style={{
                'paddingLeft': 6,
                'paddingRight': 6,
                'fontSize': 22
              }}
            >
              ++
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => onComponentRemove(selectedComponent.columnName, selectedComponent.cubeComponentCode)}
              disabled={selectedComponent === null}
              icon="minus"
              title={t('scenes.dataManager.fileMapping.wizard.componentMapper.componentRemoveButton.title')}
            />
          </Col>
        </Row>
      </Col>
      <Col className="file-mapping__file-mapping__wizardjoined__icons">
        <Button
          disabled={components.length === 0}
          onClick={() => onComponentRemoveAll()}
          icon="delete"
          title={t('scenes.dataManager.fileMapping.wizard.componentMapper.componentRemoveAllButton.title')}
        />
      </Col>
    </Row>
    <FileMappingComponentList
      value={components}
      selected={
        selectedComponent !== null
          ? `${selectedComponent.columnName}${selectedComponent.cubeComponentCode}`
          : null
      }
      onSelect={({ columnName, cubeComponentCode }) => onComponentSelect(columnName, cubeComponentCode)}
      columnNameKey="columnName"
      cubeComponentCodeKey="cubeComponentCode"
    />
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(FileMappingWizardComponentMapper);
