import FileMappingWizardComponentList from '../component-list';
import React, {Fragment} from 'react';
import {selectFileMappingWizardCubeComponentListComponent} from './actions';
import {connect} from 'react-redux';
import ReduxCodelistDetailModal from "../../../../../redux-components/redux-codelist-detail-modal";
import {DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX} from "./reducer";
import {reuseAction} from "../../../../../utils/reduxReuse";
import {showCodelistDetail} from "../../../../../redux-components/redux-codelist-detail-modal/actions";
import {getArtefactTripletFromString} from "../../../../../utils/sdmxJson";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  cube: state.scenes.dataManager.fileMapping.components.wizard.shared.cube,
  codelistDetail: state.scenes.dataManager.fileMapping.components.wizard.components.cubeComponentList.codelistDetail,
  selectedCubeComponentCode: state.scenes.dataManager.fileMapping.components.wizard.shared.selectedCubeComponentCode,
  components: state.scenes.dataManager.fileMapping.components.wizard.shared.components
});

const mapDispatchToProps = dispatch => ({
  onCodelistShow: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX)),
  onCubeComponentSelect: cubeComponentCode => dispatch(selectFileMappingWizardCubeComponentListComponent(cubeComponentCode)),
});

const FileMappingWizardCubeComponentList = ({
                                              nodeId,
                                              nodes,
                                              cube,
                                              codelistDetail,
                                              selectedCubeComponentCode,
                                              components,
                                              onCodelistShow,
                                              onCubeComponentSelect,
                                            }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <ReduxCodelistDetailModal
        instancePrefix={DM_FILE_MAPPING_WIZARD_CUBE_COMPONENT_LIST_PREFIX}
        instanceState={codelistDetail}
      />
      <FileMappingWizardComponentList
        components={
          cube !== null
            ? (
              [
                ...cube.components.dimensions.map(dim => ({
                  ...dim,
                  icon: 'bar-chart',
                })),
                ...cube.components.timeDimensions.map(dim => ({
                  ...dim,
                  icon: 'clock-circle'
                })),
                ...cube.components.attributes.map(attr => ({
                  ...attr,
                  icon: 'profile'
                })),
                ...cube.components.measures.map(meas => ({
                  ...meas,
                  icon: 'line-chart'
                }))
              ]
                .map((comp, idx) => ({
                  ...comp,
                  name: comp.Code,
                  key: idx,
                  onDetail:
                    comp.CodelistCode !== undefined && comp.CodelistCode !== null
                      ? () => onCodelistShow(getArtefactTripletFromString(comp.CodelistCode), defaultItemsViewMode)
                      : null
                }))
            ) :
            []
        }
        selected={selectedCubeComponentCode !== null ? selectedCubeComponentCode : null}
        onSelect={({Code}) => onCubeComponentSelect(Code)}
        disabled={components.map(comp => comp.cubeComponentCode)}
        hasIcon={true}
      />
    </Fragment>
  )
};

export default connect(mapStateToProps, mapDispatchToProps)(FileMappingWizardCubeComponentList);
