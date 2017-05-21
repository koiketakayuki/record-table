import { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import dateFormat from'dateformat';
import AppBar from 'material-ui/AppBar';
import RecordCreationDialog from './record-creation-dialog';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
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

const DEFAULT_DISPLAY_COUNT = 5;
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
    this.state = { records: [], open: false, count: 0, searchCondition: {}, targetRecord: {} };

    this.goToCreationMenu = this.goToCreationMenu.bind(this);
    this.goToEditionMenu = this.goToEditionMenu.bind(this);
    this.goToRecordList = this.goToRecordList.bind(this);
  }

  componentDidMount() {
    this.initializeRecord();
  }

  initializeRecord() {
    this.getRecordCount().then((count) => {
      this.setState({ count });
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

  getRecords(pageNumber) {
    const offset = this.props.displayCount * (pageNumber ? pageNumber : 1);

    return new Promise((success, failure) => {
      $.post(`${this.props.dataSourceUrl}/read`,
      {
        recordTypeId: this.rootTypeId,
        condition: this.state.searchCondition,
        option: {
          limit: this.props.displayCount,
          offset: offset,
          sort: { date: -1 }
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

  goToCreationMenu() {
    this.setState({
      open: true,
      targetRecord: null
    });
  };

  goToEditionMenu(index) {
    this.setState({
      open: true,
      targetRecord: this.state.records[index],
    });
  }

  goToRecordList() {
    this.setState({ open: false });
  };

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
          onTouchTap={this.goToCreationMenu}
        />
        <RecordCreationDialog
          open={this.state.open}
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
          全<span>{this.state.count}</span>件
        </div>
        <Table onRowSelection={(i) => this.goToEditionMenu(i)}>
            <TableHeader displaySelectAll={false}>
              <TableRow>
                {this.hierarchyFields.map(f =>
                  <TableHeaderColumn>{f.name || f.id}</TableHeaderColumn>
                )}
                <TableHeaderColumn />
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
            {this.state.records.map(r => 
              <TableRow>
                {this.hierarchyFields.map(f =>
                  <TableRowColumn>{transformFieldValue(r[f.id], f.fieldType)}</TableRowColumn>
                )}
                <TableRowColumn><DeleteIcon/></TableRowColumn>
              </TableRow>)}
            </TableBody>
        </Table>
      </div>
    </div>);
  }
}

RecordTable.propTypes = {
  dataSourceUrl: PropTypes.string.isRequired,
  recordType: PropTypes.object.isRequired,
  displayCount: PropTypes.number
};

RecordTable.defaultProps = {
  displayCount: DEFAULT_DISPLAY_COUNT
};
