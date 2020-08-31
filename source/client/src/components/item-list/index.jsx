import React from "react";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import InfiniteScrollTable, {numberStringSorter} from "../infinite-scroll-table";
import {TABLE_COL_MIN_WIDTH_ID, TABLE_COL_MIN_WIDTH_NAME} from "../../styles/constants";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";

const mapStateToProps = state => ({
  appLanguage: state.app.language
});

class ItemList extends React.Component {

  render() {

    const {
      t,
      appLanguage,
      hideOrderCol
    } = this.props;

    return (
      <DataLanguageConsumer>
        {dataLanguage => {
          const lang = dataLanguage || appLanguage;

          return (
            <InfiniteScrollTable
              {...this.props}
              getRowKey={({id}) => id}
              columns={[
                {
                  title: t('data.item.id.shortLabel'),
                  dataIndex: 'id',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                },
                {
                  title: t('data.item.name.shortLabel'),
                  dataIndex: 'name',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME
                },
                {
                  title: t('data.item.parent.shortLabel'),
                  dataIndex: 'parent',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                },
                hideOrderCol
                  ? null
                  : {
                    title: t('data.item.order.shortLabel'),
                    dataIndex: 'order',
                    widthToContent: true,
                    render: order => (
                      <div
                        title={(order && order[lang]) ? order[lang] : ''}
                        style={{width: '100%', height: '100%'}}
                      >
                        {(order && order[lang]) ? order[lang] : ''}
                      </div>
                    ),
                    renderText: order => (order && order[lang]) ? order[lang] : '',
                    sorter: numberStringSorter
                  }
              ]}
              multilangStrDataIndexes={["name"]}
            />
          )
        }}
      </DataLanguageConsumer>
    );
  }
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(ItemList);