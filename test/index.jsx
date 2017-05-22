import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom'
import RecordTable from '../source/record-table';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {
  recordType,
  enumerationType,
  textField,
  dateField,
  recordField
} from 'ameba-core';
import { createRecord } from 'ameba-util';

injectTapEventPlugin();

const statusType = enumerationType('status', 'ステータス', ['受領', 'た']);

const PaymentInformationRequest = recordType('PaymentInformationRequest', '口振請求記録', [
  textField('shopId', '店舗ID'),
  recordField('status', 'ステータス', statusType),
  textField('contactPerson', '担当者'),
  dateField('date', '日付')
]);

ReactDOM.render((
  <BrowserRouter>
    <Route path="/" component={() =>
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <RecordTable recordType={PaymentInformationRequest}
          dataSourceUrl="http://127.0.0.1:3000"
          sortCondition={{ date:  -1 }}/>
      </MuiThemeProvider>}/>
  </BrowserRouter>
  ),
  document.getElementById('root')
);