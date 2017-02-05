import db from '../models';

const Documents = db.documents;

class DocumentController {
    /**
     * Method to set the various document routes
     * @param{Object} app - Express app
     * @return{Void}
     */
    static postRequest(request) {
        return (
            request.body &&
            request.body.title &&
            request.body.content &&
            request.body.access &&
            request.body.OwnerId
        )
    }
    /**
     * Method used to create new Document for a particular user
     * @param{Object} app - Express app
     * @returns{response data}
     */
    static createDocument(request, response) {
        if (DocumentController.postRequest(request)) {
            return Documents
                .create({
                    title: request.body.title,
                    content: request.body.content,
                    access: request.body.access,
                    OwnerId: request.body.OwnerId,
                })
                .then(document => response.status(201).send(document))
                .catch(error => response.status(401).send(error));
        } else {
            response.status(404).send({
                success: false,
                message: 'some fields are missing'
            });
        }
    }
    /**
     * Method used to fetch documents for all users
     * @param{Object} app - Express app
     * @returns{response data}
     * 
     */
    static fetchDocument(request, response) {
        Documents.findAll({})
            .then(document => {
                if (document) {
                    response.status(201).send(document);
                } else {
                    response.status(404).json({
                        status: 'Failed',
                        message: 'Document not found'
                    })
                }
            })
            .catch(error => response.status(401).send(error));
    }
    /**
     * 
     */
    static fetchUserDocument(request, response) {
        Documents.find({ where: { id: request.body.id } })
            .then((document) => {
                if (document) {
                    response.status(200).send(document);
                } else {
                    response.status(404).send({
                        success: false,
                        message: 'No Document found for this User'
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
     * 
     */
    static deleteDocument(request, response) {
        Documents.findOne({
            where: {
                id: request.body.id
            }
        })
            .then(document => {
                if (document) {
                    document.destroy()
                        .then(() => response.status(201).send({
                            success: true,
                            message: 'Document has been successfully deleted'
                        }))
                        .catch(error => response.status(401).send(error))
                } else {
                    response.status(404).send({
                        success: false,
                        message: 'Document not found'
                    })
                }
            })
            .catch(error => response.status(401).send(error));
    }
    /**
     * 
     */
    static updateDocument(request, response) {
        Documents.findOne({ where: { id: request.body.id } })
            .then(document => {
                if (document) {
                    document.update(request.body)
                        .then(updatedDocument => response.status(201).send(updatedDocument))
                        .catch(error => response.status(401).send(error));
                } else {
                    response.status(404).send({
                        success: false,
                        message: 'Document not found'
                    })
                }
            })
            .catch(error => response.status(401).send(error));
    }

}
export default DocumentController;
