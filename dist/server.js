'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _documentController = require('./controllers/documentController');

var _documentController2 = _interopRequireDefault(_documentController);

var _index = require('./routes/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

// setup the app
var app = express();
var port = parseInt(process.env.PORT, 10) || 2000;
app.use(logger('dev'));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//-----Routes-------------//
_index2.default.Roles(app);
_index2.default.Users(app);
_index2.default.Documents(app);
// app.get('/users/:id/documents', DocumentController.fetchUserDocument);
_index2.default.Index(app);
app.listen(port, function () {
  console.log('\nApp running on port ', port);
});
exports.default = app;