import { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import dateFormat from'dateformat';
import AppBar from 'material-ui/AppBar';
import RecordPresenterDialog from './record-presenter-dialog';
import RecordDeleteConfirmationDialog from './record-delete-confirmation-dialog';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ReactPaginate from 'react-paginate';
import { getRootType, getHierarchyFields } from 'ameba-util';
import { Types, Fields } from 'ameba-core';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const DEFAULT_DISPLAY_COUNT = 10;
const DATE_FORMAT = 'yyyy年m月d日 H時MM分';

function transformFieldValue(fieldValue, fieldType) {
  if (fieldType.id === Types.DateType.id) {
    return dateFormat(new Date(fieldValue), DATE_FORMAT);
  }

  return fieldValue;
}

export default class RecordTable extends Component {

  constructor(props) {
    super(props);
    this.recordType = props.recordType;
    this.rootTypeId = getRootType(this.recordType).id;
    this.hierarchyFields = getHierarchyFields(this.recordType).filter(f => f.id !== Fields.type.id);
    this.state = {
      records: [],
      isCreateOrEditMode: false,
      isDeleteConfimation: false,
      recordCount: 0,
      pageCount: 0,
      maxPageCount: 0,
      startCount: 1,
      endCount: this.props.displayCount,
      searchCondition: {},
      targetRecord: {} };

    this.goToCreateMenu = this.goToCreateMenu.bind(this);
    this.goToEditMenu = this.goToEditMenu.bind(this);
    this.goToRecordList = this.goToRecordList.bind(this);
    this.goToDeleteMenu = this.goToDeleteMenu.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
  }

  componentDidMount() {
    this.initializeRecord();
  }

  initializeRecord() {
    this.getRecordCount().then((recordCount) => {
      const maxPageCount = Math.ceil(recordCount / this.props.displayCount);
      this.setState({ recordCount, maxPageCount });
    });
    this.getRecords().then(records => {
      this.setState({ records });
    });
  }

  getRecordCount() {
    return new Promise((success, failure) => {
      $.post(`${this.props.dataSourceUrl}/count`,
      { recordTypeId: this.rootTypeId, condition: this.state.searchCondition },
      res => {
        if (res.ok) {
          success(res.count);
        } else {
          failure(res.message);
        }
      });
    });
  }

  getRecords(pageCount) {
    const offset = this.props.displayCount * (pageCount || this.state.pageCount);

    return new Promise((success, failure) => {
      $.post(`${this.props.dataSourceUrl}/read`,
      {
        recordTypeId: this.rootTypeId,
        condition: this.state.searchCondition,
        option: {
          limit: this.props.displayCount,
          skip: offset,
          sort: this.props.sortCondition
        }
      },
      res => {
        if (res.ok) {
          success(res.result);
        } else {
          failure(res.message);
        }
      });
    });
  }

  goToCreateMenu() {
    this.setState({
      isCreateOrEditMode: true,
      targetRecord: null
    });
  };

  goToEditMenu(index) {
    if (!this.state.isDeleteConfimation) {
      this.setState({
        isCreateOrEditMode: true,
        isDeleteConfimation: false,
        targetRecord: this.state.records[index],
      });
    }
  }

  goToDeleteMenu(record) {
    this.setState({
      isCreateOrEditMode: false,
      isDeleteConfimation: true,
      targetRecord: record
    });
  }

  goToRecordList() {
    this.setState({
      isCreateOrEditMode: false,
      isDeleteConfimation: false
    });
  };

  handlePageClick(pageCount) {
    this.getRecords(pageCount).then(records => {
      const displayCount = this.props.displayCount;
      const startCount = pageCount * displayCount + 1;
      const endCount = Math.min(startCount + displayCount, this.state.recordCount);
      this.setState({ records, pageCount, startCount, endCount });
    });
  }

  render() {
    return (
    <div>
      <AppBar
        title={this.props.recordType.name || this.props.recordType.id}
        showMenuIconButton={false}
        iconClassNameRight="muidocs-icon-navigation-expand-more"/>
      <div>
        <FlatButton
          label="追加する"
          labelPosition="after"
          primary={true}
          icon={<ContentAdd />}
          onTouchTap={this.goToCreateMenu}
        />
        <RecordDeleteConfirmationDialog
          open={this.state.isDeleteConfimation}
          recordType={this.props.recordType}
          record={this.state.targetRecord}
          dataSourceUrl={this.props.dataSourceUrl}
          onDelete={(res) => {
            this.goToRecordList();
            this.initializeRecord();
          }}
          onCancel={this.goToRecordList}/>
        <RecordPresenterDialog
          open={this.state.isCreateOrEditMode}
          recordType={this.props.recordType}
          record={this.state.targetRecord}
          dataSourceUrl={this.props.dataSourceUrl}
          hierarchyFields={this.hierarchyFields}
          onSave={(res) => {
            this.goToRecordList();
            this.initializeRecord();
          }}
          onCancel={this.goToRecordList}/>
        <div>
          全<span>{this.state.recordCount}</span>件 <span>{this.state.startCount}</span> ~ <span>{this.state.endCount}</span>件を表示
        </div>
        <Table onRowSelection={index => this.goToEditMenu(index)}>
            <TableHeader displaySelectAll={false}>
              <TableRow>
                {this.hierarchyFields.map(f =>
                  <TableHeaderColumn>{f.name || f.id}</TableHeaderColumn>
                )}
                <TableHeaderColumn>削除</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
            {this.state.records.map(r => 
              <TableRow>
                {this.hierarchyFields.map(f =>
                  <TableRowColumn>{transformFieldValue(r[f.id], f.fieldType)}</TableRowColumn>
                )}
                <TableRowColumn>
                  <IconButton onTouchTap={(e) => {
                    this.goToDeleteMenu(r)
                  }}>
                    <DeleteIcon/>
                  </IconButton>
                </TableRowColumn>
              </TableRow>)}
            </TableBody>
        </Table>
      </div>
      {(this.state.maxPageCount > 0) ?
        <ReactPaginate previousLabel={"previous"}
                  nextLabel={"next"}
                  breakLabel={<a href="">...</a>}
                  pageCount={this.state.maxPageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={o => this.handlePageClick(o.selected)}
                  containerClassName={"pagination"}
                  activeClassName={"active"} /> : null}
    </div>);
  }
}

RecordTable.propTypes = {
  dataSourceUrl: PropTypes.string.isRequired,
  recordType: PropTypes.object.isRequired,
  displayCount: PropTypes.number,
  sortCondition: PropTypes.object
};

RecordTable.defaultProps = {
  displayCount: DEFAULT_DISPLAY_COUNT,
  sortCondition: {}
};
