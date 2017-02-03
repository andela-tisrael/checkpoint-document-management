'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _models = require('../models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Users = _models2.default.users;

var UserController = function () {
  function UserController() {
    _classCallCheck(this, UserController);
  }

  _createClass(UserController, null, [{
    key: 'postRequest',

    /**
     * 
     */
    value: function postRequest(request) {
      return request.body && request.body.username && request.body.firstname && request.body.lastname && request.body.password && request.body.email && request.body.RoleId;
    }
    /**
     * 
     */

  }, {
    key: 'createUser',
    value: function createUser(request, response) {
      if (UserController.postRequest(request)) {
        return Users.create({
          username: request.body.username,
          firstName: request.body.firstname,
          lastName: request.body.lastname,
          password: request.body.password,
          email: request.body.email,
          RoleId: request.body.RoleId
        }).then(function (user) {
          return res.status(201).send(user);
        }).catch(function (error) {
          return res.status(401).send(error);
        });
      }
    }
    /**
     * 
     */

  }, {
    key: 'fetchUser',
    value: function fetchUser(request, response) {
      Users.findOne({ where: { id: request.params.id } }).then(function (user) {
        if (user) {
          response.status(200).send(user);
        } else {
          response.status(404).send({
            status: 'Failed',
            message: 'User not found'
          });
        }
      }).catch(function (error) {
        response.status(400).send({
          error: error
        });
      });
    }
  }]);

  return UserController;
}();

exports.default = UserController;