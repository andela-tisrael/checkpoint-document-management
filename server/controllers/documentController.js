import db from '../models';
import DocumentHelper from './helpers/documentHelper';

const Documents = db.documents;
const Users = db.users;

/**
 * Controller for document management
 */
class DocumentController {
  /**
   * Method to set the various document routes
   * @param{Object} request - Server request
   * @return{Object} return request parameters
   */
  static postRequest(request) {
    return (
      request.body &&
      request.body.title &&
      request.body.content &&
      request.body.access &&
      request.decoded.UserId
    );
  }

  /**
   * Method used to create new Document for a particular user
   * @param{Object} request - Server Request
   * @param{Object} response - Server Response
   * @returns{Void} return Void
   */
  static createDocument(request, response) {
    if (DocumentController.postRequest(request)) {
      Documents
        .create({
          title: request.body.title,
          content: request.body.content,
          access: request.body.access ? request.body.access : 'public',
          OwnerId: request.decoded.UserId,
        }).then((document) => {
          response.status(201).send({
            success: true,
            message: 'Document successfully created',
            document: document.dataValues
          });
        }).catch((error) => {
          response.status(400).send({
            success: false,
            message: error.message
          });
        });
    } else {
      response.status(400).send({
        success: false,
        message: 'Some fields are missing'
      });
    }
  }

  /**
   * Fetch specific document in the database
   * Admin has access to all the documents
   * Users only have access to their private documents and all other public documents.
   * @param{Object} request - Server request
   * @param{Object} response - Server response
   * @return {Void} - returns Void
   */
  static fetchDocuments(request, response) {
    const UserId = request.decoded.UserId;
    let RoleId;
    Users.findById(UserId).then((user) => { RoleId = user.dataValues.roleId; });
    Documents.findOne({
      where: {
        id: request.params.id
      },
      include: [{
        model: db.users,
        attributes: ['roleId']
      }]
    }).then((result) => {
      const document = result ? result.dataValues : null;
      if (document) {
        // if the requester's role id is Admin, allow unrestricted access
        if (RoleId === 1) {
          response.status(200).send({
            success: true,
            message: 'Document found',
            document
          });
        } else if ((document.access === 'public') ||
          (document.user.roleId === RoleId
            && document.access !== 'private')) {
          response.status(200).send({
            success: true,
            message: 'Document Found',
            document
          });
        } else if (document.access === 'private' && document.OwnerId === UserId) {
          response.status(200).send({
            success: true,
            message: 'Document Found',
            document
          });
        } else {
          response.status(401).send({
            success: false,
            message: 'You cannot access this document'
          });
        }
      } else {
        response.status(404).send({
          success: false,
          message: `Document with id ${request.params.id} not found in the database`
        });
      }
    });
  }
  /**
   * Fetch specific document in the database
   * Admin has access to all the documents
   * Users only have access to their private documents and all other public documents.
   * @param{Object} request - Server request
   * @param{Object} response - Server response
   * @return {Void} - returns Void
   */
  static fetchDocument(request, response) {
    let searchQuery = request.query.search;
    const searchLimit = request.query.limit;
    const userId = request.decoded.UserId;
    let roleId;
    Users.findById(userId).then((user) => {
      roleId = user.roleId;
      const queryBuilder = {
        attributes: ['id', 'OwnerId', 'access', 'title', 'content', 'createdAt'],
        order: '"createdAt" DESC',
        include: [{
          model: db.users,
          attributes: ['roleId']
        }]
      };
      queryBuilder.offset = (request.query.offset > 0) ? request.query.offset : 0;
      if (searchLimit) {
        queryBuilder.limit = searchLimit;
      }

      if (roleId === 1) {
        if (searchQuery) {
          searchQuery = DocumentHelper.sanitizeString(searchQuery);
          queryBuilder.where = {
            $or: [{
              title:
              { $like: `%${searchQuery}%` }
            }, {
              content:
              { $like: `%${searchQuery}%` }
            }]
          };
        }
        Documents.findAndCountAll(queryBuilder)
          .then((results) => {
            // results.rows.forEach(data => {
            //   console.log(data.dataValues.user.roleId);
            //   console.log(data.dataValues.access);
            // });
            if (results.count < 1) {
              response.status(404).send({
                success: false,
                message: 'No Document Found'
              });
            } else {
              response.status(200).send({
                success: true,
                results
              });
            }
          });
      } else {
        if (searchQuery) {
          searchQuery = DocumentHelper.sanitizeString(searchQuery);
          queryBuilder.where = {
            $or: [
              { title: { $like: `%${searchQuery}%` } },
              { content: { $like: `%${searchQuery}%` } }
            ],
            $and: {
              $or: [
                { access: 'public' },
                { OwnerId: userId }
              ]
            }
          };
        }
        Documents.findAndCountAll(queryBuilder).then((results) => {
          const accessibleDocuments = results.rows.filter((document) => {
            if ((document.dataValues.access === 'public') ||
              (document.dataValues.user.roleId === roleId
                && document.dataValues.access !== 'private')) {
              return true;
            } else if (document.dataValues.access === 'private' && document.dataValues.OwnerId === userId) {
              return true;
            }
            return false;
          });

          const offset = queryBuilder.offset;
          const limit = queryBuilder.limit;

          const pagination = DocumentHelper.paginateResult(accessibleDocuments, offset, limit);

          response.status(200).send({
            success: true,
            results: accessibleDocuments,
            pagination
          });
        });
      }
    });
  }

  /**
   * Fetch all the documents belonging to a particular user
   * Users have access to their own documents and all other public and role access documents
   * @param{Object} request - Server request
   * @param{Object} response - Server response
   * @return{Void} - return Void
   */
  static fetchUserDocument(request, response) {
    const queryId = request.params.id;
    const ownerId = request.decoded.UserId;
    let roleId;
    Users.findById(ownerId).then((user) => {
      roleId = user.dataValues.roleId;
      if (ownerId === queryId || roleId === 1) {
        Documents.findAll({
          where: {
            OwnerId: queryId
          }
        }).then((document) => {
          if (document.length < 1) {
            return response.status(404).send({
              success: false,
              message: 'No documents found'
            });
          }
          const results = document;
          return response.status(200).send(results);
        });
      } else {
        Documents.findAll({
          where: {
            OwnerId: queryId,
            $and: {
              access: 'public'
            }
          }
        }).then((document) => {
          if (document.length < 1) {
            return response.status(404).send({
              success: false,
              message: 'No documents found'
            });
          }
          const results = document;
          return response.status(200).send(results);
        });
      }
    });
  }

  /**
   * Edit and Update User documents in the database
   * Users only have access to their own documents
   * @param{Object} request - Server request
   * @param{Object} response - Server response
   * @return {Void} - returns Void
   */
  static updateDocument(request, response) {
    const Owner = request.decoded.UserId;
    let Role;
    Users.findById(Owner).then((user) => { Role = user.dataValues.roleId; });
    Documents.findOne({
      where: {
        id: request.params.id
      }
    }).then((document) => {
      if (document.OwnerId === Owner || Role === 1) {
        document.update(request.body)
          .then(updatedDocument => response.status(201).send(updatedDocument))
          .catch(error => response.status(401).send(error));
      } else {
        response.status(401).send({
          success: false,
          role: Role,
          message: 'You are not authorized to update this document'
        });
      }
    }).catch(error => response.status(401).send(error));
  }

  /**
   * Delete User documents in the database
   * Users only have access to their own documents
   * @param{Object} request - Server request
   * @param{Object} response - Server response
   * @return {Void} - returns Void
   */
  static deleteDocument(request, response) {
    const Owner = request.decoded.UserId;
    let Role;
    Users.findById(Owner).then((user) => { Role = user.dataValues.roleId; });
    Documents.findOne({
      where: {
        id: request.params.id
      }
    }).then((document) => {
      if (document.OwnerId === Owner || Role === 1) {
        document.destroy()
          .then(() => response.status(201).send({
            success: true,
            message: 'Document has been successfully deleted'
          }));
      } else {
        response.status(401).send({
          success: false,
          message: 'You are not authorized to delete this document'
        });
      }
    }).catch(error => response.status(401).send(error));
  }
}
export default DocumentController;
