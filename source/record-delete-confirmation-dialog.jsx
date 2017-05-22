import { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { getRootType } from 'ameba-util';

export default class RecordDeleteConfirmationDialog extends Component {

  constructor(props) {
    super(props);
    this.deleteRecord = this.deleteRecord.bind(this);
    this.rootTypeId = getRootType(this.props.recordType).id;
  }

  deleteRecord() {
    $.post(`${this.props.dataSourceUrl}/delete`,
      {
        recordTypeId: this.rootTypeId,
        condition: { _id: this.props.record._id }
      },
      res => {
        this.props.onDelete(res);
      });
  }

  render() {
    const actions = [
      <FlatButton
        label="キャンセル"
        primary={true}
        onTouchTap={this.props.onCancel}
        />,
      <FlatButton
        label="削除"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.deleteRecord}
        />,
    ];

    return (
      <Dialog
        title="レコードの削除"
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onCancel}>
        <div>
          本当に削除してもよろしいですか？
        </div>
      </Dialog>);
  }
}

RecordDeleteConfirmationDialog.propTypes = {
  dataSourceUrl: PropTypes.string.isRequired,
  recordType: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  open: PropTypes.bool
};

RecordDeleteConfirmationDialog.defaultProps = {
  open: false,
};
