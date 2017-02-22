/* eslint-disable import/no-unresolved */
import jwt from 'jsonwebtoken';
import db from '../models';
import Authenticate from '../middleware/auth';

const Users = db.users;
const SECRET_KEY = process.env.SECRET || 'secret';

/**
 * Controller for Users
 */
class UserController {
  /**
   * Method to set the various document routes
   * @param{Object} request - Server request
   * @return{Void} return Void
   */
  static postRequest(request) {
    return (
      request.body &&
      request.body.username &&
      request.body.firstname &&
      request.body.lastname &&
      request.body.password &&
      request.body.email &&
      request.body.RoleId
    );
  }
  /**
   * Method used to create new user
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static createUser(request, response) {
    if (UserController.postRequest(request)) {
      return Users
        .create({
          username: request.body.username,
          firstName: request.body.firstname,
          lastName: request.body.lastname,
          password: request.body.password,
          email: request.body.email,
          RoleId: request.body.RoleId
        })
        .then(user => response.status(201).send({
          success: true,
          message: 'User successfully signed up',
          RoleId: user.RoleId,
          token: Authenticate.generateToken(user)
        }))
        .catch(error => response.status(500).send(error));
    }
    response.status(400).send({
      success: false,
      message: 'You did not input your field properly'
    });
  }
  /**
   * Method used to delete user
   * only accessible to admin
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static deleteUser(request, response) {
    Users.findOne({ where: { id: request.params.id } })
      .then((user) => {
        if (user) {
          user.destroy()
            .then(() => response.status(200).send({
              success: true,
              message: 'User Successfully deleted from database'
            }))
            .catch(error => response.status(401).send(error));
        } else {
          response.status(404).send({
            success: false,
            message: 'User not found'
          });
        }
      })
      .catch(error => response.status(404).send(error));
  }
  /**
   * Method used to Update user info
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static updateUser(request, response) {
    Users.findOne({
      where: { id: request.params.id }
    })
      .then((user) => {
        if (user) {
          user.update(request.body)
            .then(updatedUser => response.status(201).send(updatedUser))
            .catch(error => response.status(401).send(error));
        } else {
          response.status(404).send({
            success: false,
            message: 'User not found'
          });
        }
      })
      .catch(error => response.status(401).send(error));
  }
  /**
   * Method used to fetch all users
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static fetchAllUsers(request, response) {
    Users.findAll({})
      .then((users) => {
        if (users) {
          response.status(201).send(users);
        } else {
          response.status(404).send({
            success: false,
            message: 'No user on this database'
          });
        }
      })
      .catch(error => response.status(401).send(error));
  }
  /**
   * Method used to fetch user by their ID
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static fetchUser(request, response) {
    Users.findOne({ where: { id: request.params.id } })
      .then((user) => {
        if (user) {
          response.status(200).send(user);
        } else {
          response.status(404).send({
            success: false,
            message: 'User not found'
          });
        }
      })
      .catch((error) => {
        response.status(400).send({
          error
        });
      });
  }
  /**
   * Method used to create new user
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static loginUser(request, response) {
    Users.findOne({ where: { email: request.body.email } })
      .then((user) => {
        if (user && user.validPassword(request.body.password)) {
          const token = jwt.sign({
            RoleId: user.RoleId,
            UserId: user.id
          }, SECRET_KEY, { expiresIn: 86400 });
          response.status(201).send({ token, expiresIn: 86400 });
        } else {
          response.status(401).send({
            success: false,
            message: 'Failed to Authenticate User, Invalid Password or Email'
          });
        }
      })
      .catch(error => response.status(404).send({
        message: `Error!, \n${error.message}`
      }));
  }
  /**
   * Method used to logout user
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static logoutUser(request, response) {
    response.send({
      success: true,
      message: 'User logged out successfully'
    });
  }
}
export default UserController;
