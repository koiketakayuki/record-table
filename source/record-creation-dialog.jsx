import { Component } from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import DatePicker from 'material-ui/DatePicker';
import MenuItem from 'material-ui/MenuItem';
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

const formStyle = {
  'display': 'table-cell',
  'verticalAlign': 'middle'
};

export default class RecordTable extends Component {

  constructor(props) {
    super(props);
    this.dispatchField = this.dispatchField.bind(this);
    this.updateRecord = this.updateRecord.bind(this);
    this.saveRecord = this.saveRecord.bind(this);
    this.afterInitialize = this.afterInitialize.bind(this);
    this.state = { value: this.props.record };
    this.rootTypeId = getRootType(this.props.recordType).id;
  }

  componentDidMount() {

  }

  afterInitialize(proc) {
    return (arg) => {
      this.setState({
        value: {}
      });
      proc(arg);
    }
  }

  updateRecord() {
    $.post(`${this.props.dataSourceUrl}/update`,
      { recordTypeId: this.rootTypeId,
        value: this.state.value,
        condition: { _id: this.props.record._id }
       },
      res => {
        this.afterInitialize(this.props.onSave)(res);
      });
  }

  saveRecord() {
    $.post(`${this.props.dataSourceUrl}/save`,
      { recordTypeId: this.rootTypeId, value: this.state.value },
      res => {
        this.afterInitialize(this.props.onSave)(res);
      });
  }

  updateValue(key, value) {
    const currentValue = this.state.value;
    currentValue[key] = value;
    this.setState({ value: currentValue });
  }

  dispatchField(field) {
    if (field.fieldType.id === Types.TextType.id) {
      return <div style={formStyle}>
               <TextField floatingLabelText={field.name}
                          defaultValue={this.props.record ? this.props.record[field.id] : field.defaultValue}
                          onChange={(e,value) => this.updateValue(field.id, value)}/>
             </div>;
    }

    if (field.fieldType.type.id === Types.EnumerationType.id) {
        return (
        <div style={formStyle}>
            <SelectField
              floatingLabelText={field.name}
              value={this.props.record ? this.props.record[field.id] : this.state.value[field.id]}
              onChange={(e, i, v) => this.updateValue(field.id, v)}>
                {field.fieldType.values.map(v =>
                  <MenuItem value={v} primaryText={v} />)
                }
            </SelectField>
        </div>);
    }

    if (field.fieldType.id === Types.DateType.id) {
        return <div style={formStyle}>
                 <DatePicker
                   hintText={field.name}
                   defaultDate={this.props.record ? new Date(this.props.record[field.id]) : null}
                   onChange={(e, value) => this.updateValue(field.id, value.toString())}/>
               </div>;
    }
    return <div>null</div>;
  }

  render() {
    const actions = [
      <FlatButton
        label="キャンセル"
        primary={true}
        onTouchTap={this.afterInitialize(this.props.onCancel)}
        />,
      <FlatButton
        label={this.props.record ? "変更" : "作成"}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.props.record ? this.updateRecord : this.saveRecord}
        />,
    ];

    return (
      <Dialog
        title={`${this.props.recordType.name}の${this.props.record ? "変更" : "作成"}`}
        actions={actions}
        open={this.props.open}
        onRequestClose={this.afterInitialize(this.props.onCancel)}
        autoScrollBodyContent={true}>
        <div id="container">
          {this.props.hierarchyFields.map(f =>
            <div>{this.dispatchField(f)}</div>
          )}
        </div>
      </Dialog>);
  }
}

RecordTable.propTypes = {
  dataSourceUrl: PropTypes.string.isRequired,
  recordType: PropTypes.object.isRequired,
  record: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  hierarchyFields: PropTypes.array.isRequired,
  open: PropTypes.bool
};

RecordTable.defaultProps = {
  open: false,
  record: {}
};
