import React, {Fragment} from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Col, Icon, Modal, Row} from "antd";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../utils/sdmxJson";
import {
  BUTTON_CLONE,
  BUTTON_CONTENT_CONSTRAINTS,
  BUTTON_CUSTOM_ANNOTATIONS,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_DOWNLOAD,
  BUTTON_EXPORT,
  BUTTON_MANAGE_OWNERS,
  BUTTON_LAYOUT_ANNOTATIONS,
  BUTTON_PARENTS_AND_CHILDREN
} from "../../styles/buttons";
import {GUTTER_SM, MODAL_WIDTH_LG, TABLE_COL_MIN_WIDTH_ID, TABLE_COL_MIN_WIDTH_NAME} from "../../styles/constants";
import {PATH_IMPORT_STRUCTURES} from "../../constants/paths";
import {countCustomAnnotations, countLayoutAnnotations} from "../../utils/annotations";
import Call from "../../hocs/call";
import EnhancedModal from "../enhanced-modal";
import InfiniteScrollTable from "../infinite-scroll-table";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";

const mapStateToProps = state => ({
  username: state.app.user.username,
  permissions: state.app.user.permissions,
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  appLanguage: state.app.language
});

class ArtefactList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isParentsAndChildrenVisible: false,
      artefactTriplet: null
    };
    this.onParentsAndChildrenShow = this.onParentsAndChildrenShow.bind(this);
    this.onParentsAndChildrenHide = this.onParentsAndChildrenHide.bind(this);
  }

  onParentsAndChildrenShow(artefactTriplet) {
    this.setState({
      isParentsAndChildrenVisible: true,
      artefactTriplet: artefactTriplet
    });
  }

  onParentsAndChildrenHide() {
    this.setState({
      isParentsAndChildrenVisible: false,
      artefactTriplet: null
    });
    this.props.onParentsAndChildrenHide()
  }

  render() {

    const {
      t,
      username,
      permissions,
      artefacts,
      endpoints,
      endpointId,
      appLanguage,
      getIsDisabledRow,
      onCreate,
      onDetailShow,
      onDownloadShow,
      onCloneShow,
      onExportShow,
      onOwnershipShow,
      onContentConstraintsShow,
      ownershipPermissions,
      onDelete,
      onSelectedItemDelete,
      onRowClick,
      onAnnotationsShow,
      onLayoutAnnotationsShow,
      parentsAndChildren,
      fetchParentsAndChildren,
      onParentsAndChildrenHide,
      showImportButton
    } = this.props;

    const {
      isParentsAndChildrenVisible,
      artefactTriplet
    } = this.state;

    const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
    const customAnnotationsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;

    return (
      <Fragment>
        <DataLanguageConsumer>
          {dataLanguage => {
            const lang = dataLanguage || appLanguage;
            return (
              <InfiniteScrollTable
                data={artefacts ? artefacts.sort((a, b) => a.id.localeCompare(b.id)) : null}
                getRowKey={({urn}) => urn}
                columns={[
                  {
                    title: t('data.artefact.id.shortLabel'),
                    dataIndex: 'id',
                    minWidth: TABLE_COL_MIN_WIDTH_ID
                  },
                  {
                    title: t('data.artefact.agencyID.shortLabel'),
                    dataIndex: 'agencyID',
                    widthToContent: true,
                    withValuesFilter: true
                  },
                  {
                    title: t('data.artefact.name.shortLabel'),
                    dataIndex: 'name',
                    minWidth: TABLE_COL_MIN_WIDTH_NAME
                  },
                  {
                    title: t('data.artefact.version.shortLabel'),
                    dataIndex: 'version',
                    widthToContent: true,
                    withValuesFilter: true
                  },
                  {
                    title: t('data.artefact.isFinal.shortLabel'),
                    dataIndex: "isFinal",
                    width: 30,
                    withValuesFilter: true,
                    render: isFinal => isFinal
                      ? <Icon type="check"/>
                      : null,
                    renderText: isFinal => isFinal
                      ? t('data.artefact.isFinal.values.final')
                      : t('data.artefact.isFinal.values.notFinal')
                  }
                ]}
                multilangStrDataIndexes={["name"]}
                actions={[]
                  .concat(onDetailShow
                    ? ({agencyID}) => ({
                      ...BUTTON_DETAIL,
                      title: (permissions && permissions.agencies.find(agency => agency === agencyID))
                        ? t('commons.actions.detail.title')
                        : t('commons.actions.detailReadOnly.title'),
                      onClick: ({id, agencyID, version}) => onDetailShow({id, agencyID, version})
                    })
                    : []
                  )
                  .concat((fetchParentsAndChildren && onParentsAndChildrenHide)
                    ? {
                      ...BUTTON_PARENTS_AND_CHILDREN,
                      title: t('commons.actions.parentsAndChildren.title'),
                      onClick: ({id, agencyID, version}) => this.onParentsAndChildrenShow({id, agencyID, version})
                    }
                    : []
                  )
                  .concat(onContentConstraintsShow
                    ? {
                      ...BUTTON_CONTENT_CONSTRAINTS,
                      title: t('components.artefactList.showContentConstraints.title'),
                      onClick: ({id, agencyID, version}) => onContentConstraintsShow({id, agencyID, version})
                    }
                    : []
                  )
                  .concat(onDownloadShow
                    ? {
                      ...BUTTON_DOWNLOAD,
                      title: t('commons.actions.download.title'),
                      onClick: ({id, agencyID, version}) => onDownloadShow([{id, agencyID, version}], lang)
                    }
                    : []
                  )
                  .concat((username && onCloneShow)
                    ? {
                      ...BUTTON_CLONE,
                      title: t('commons.actions.clone.title'),
                      onClick: ({id, agencyID, version}) => onCloneShow({id, agencyID, version})
                    }
                    : []
                  )
                  .concat(onExportShow
                    ? {
                      ...BUTTON_EXPORT,
                      title: t('commons.actions.export.title'),
                      onClick: ({id, agencyID, version}) => onExportShow({id, agencyID, version})
                    }
                    : []
                  )
                  .concat((onOwnershipShow && ownershipPermissions)
                    ? ({id, agencyID, version}) =>
                      ownershipPermissions.includes(getStringFromArtefactTriplet({id, agencyID, version}))
                        ? ({
                          ...BUTTON_MANAGE_OWNERS,
                          title: t('commons.actions.manageOwners.title'),
                          onClick: () => onOwnershipShow(getStringFromArtefactTriplet({
                            id,
                            agencyID,
                            version
                          }))
                        })
                        : null
                    : []
                  )
                  .concat((username && onDelete)
                    ? ({
                      ...BUTTON_DELETE,
                      title: t('commons.actions.delete.title'),
                      onClick: ({id, agencyID, version}, deselect) => Modal.confirm({
                        title: t('components.artefactList.modals.confirms.delete.title'),
                        onOk() {
                          deselect();
                          onDelete({id, agencyID, version});
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    })
                    : []
                  )
                }
                fixedActions={[]
                  .concat(onAnnotationsShow
                    ? ({id, agencyID, version, annotations}) => {
                      const customAnnotationsCount = countCustomAnnotations(annotations, customAnnotationsConfig);
                      return (customAnnotationsCount > 0)
                        ? {
                          ...BUTTON_CUSTOM_ANNOTATIONS,
                          title: t('commons.actions.customAnnotations.title') + ": " + customAnnotationsCount,
                          onClick: () => onAnnotationsShow(annotations, {id, agencyID, version})
                        }
                        : null;
                    }
                    : []
                  )
                  .concat((username && onLayoutAnnotationsShow)
                    ? ({id, agencyID, version, annotations}) => {
                      const layoutAnnotationsCount = countLayoutAnnotations(annotations, annotationsConfig);
                      return (layoutAnnotationsCount > 0)
                        ? ({
                          ...BUTTON_LAYOUT_ANNOTATIONS,
                          title: t('commons.actions.layoutAnnotations.title') + ": " + layoutAnnotationsCount,
                          onClick: () => onLayoutAnnotationsShow(annotations, {id, agencyID, version})
                        })
                        : null;
                    }
                    : []
                  )
                }
                tableActions={[
                  onDownloadShow
                    ? {
                      icon: "download",
                      title: t('commons.actions.download.title'),
                      hasRectangularButton: true,
                      onClick: selectedArr => {
                        onDownloadShow(selectedArr.map(cl => getArtefactTripletFromUrn(cl.urn)), lang);
                      }
                    }
                    : null,
                  (username && onSelectedItemDelete)
                    ? {
                      icon: "delete",
                      title: t('commons.actions.delete.title'),
                      hasRectangularButton: true,
                      onClick: (selectedArr, deselect) => {
                        Modal.confirm({
                          title: t('components.artefactList.modals.confirms.multiDelete.title', {count: selectedArr.length}),
                          onOk() {
                            deselect();
                            onSelectedItemDelete(selectedArr.map(cl => getArtefactTripletFromUrn(cl.urn)));
                          },
                          cancelText: t('commons.buttons.cancel.title')
                        })
                      }
                    }
                    : null
                ]}
                rightActions={((onCreate || showImportButton) && username)
                  ? (
                    <Row type="flex" justify="end" gutter={GUTTER_SM}>
                      {permissions && permissions.functionality.filter(func =>
                        func === PATH_IMPORT_STRUCTURES.substr(PATH_IMPORT_STRUCTURES.lastIndexOf("/") + 1)
                      ).length > 0 && (
                        <Col>
                          <a href={`./#${PATH_IMPORT_STRUCTURES}`}>
                            <Button icon="upload">
                              {t('components.artefactList.buttons.import.title')}
                            </Button>
                          </a>
                        </Col>
                      )}
                      {onCreate && (
                        <Col>
                          <Button type="primary" icon="plus" onClick={onCreate}>
                            {t('components.artefactList.buttons.create.title')}
                          </Button>
                        </Col>
                      )}
                    </Row>
                  )
                  : null
                }
                onRowClick={onRowClick}
                getIsDisabledRow={getIsDisabledRow}
              />
            )
          }}
        </DataLanguageConsumer>
        <EnhancedModal
          visible={isParentsAndChildrenVisible}
          onCancel={this.onParentsAndChildrenHide}
          title={t('components.artefactList.modals.parentsAndChildren.title')}
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={this.onParentsAndChildrenHide}>{t('commons.buttons.close.title')}</Button>}
        >
          <Call
            cb={fetchParentsAndChildren}
            cbParam={artefactTriplet}
            disabled={!isParentsAndChildrenVisible}
          >
            <InfiniteScrollTable
              data={parentsAndChildren}
              getRowKey={({id, agency, version}) => getStringFromArtefactTriplet({id, agency, version})}
              columns={[
                {
                  title: t('data.artefact.id.shortLabel'),
                  dataIndex: 'id',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                },
                {
                  title: t('data.artefact.agencyID.shortLabel'),
                  dataIndex: 'agency',
                  widthToContent: true,
                  withValuesFilter: true
                },
                {
                  title: t('data.artefact.name.shortLabel'),
                  dataIndex: 'names',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME
                },
                {
                  title: t('data.artefact.version.shortLabel'),
                  dataIndex: 'version',
                  widthToContent: true,
                  withValuesFilter: true
                },
                {
                  title: t('data.artefact.isFinal.shortLabel'),
                  dataIndex: "isFinal",
                  width: 30,
                  withValuesFilter: true,
                  render: isFinal => isFinal
                    ? <Icon type="check"/>
                    : null,
                  renderText: isFinal => isFinal
                    ? t('data.artefact.isFinal.values.final')
                    : t('data.artefact.isFinal.values.notFinal')
                },
                {
                  title: t('data.artefact.type.shortLabel'),
                  dataIndex: 'artefactType',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME,
                  withValuesFilter: true
                },
                {
                  title: t('data.artefact.relationship.shortLabel'),
                  dataIndex: 'referenceType',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME,
                  withValuesFilter: true,
                  render: referenceType => referenceType === "children"
                    ? t('data.artefact.relationship.children.label')
                    : t('data.artefact.relationship.parent.label'),
                  renderText: referenceType => referenceType === "children"
                    ? t('data.artefact.relationship.children.label')
                    : t('data.artefact.relationship.parent.label')
                }
              ]}
              multilangStrDataIndexes={["names"]}
            />
          </Call>
        </EnhancedModal>
      </Fragment>
    )
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(ArtefactList);
