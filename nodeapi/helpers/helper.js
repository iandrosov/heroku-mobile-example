/**
 * Copyright (C) 2015 All Rights Reserved.
 */
"use strict";

/**
 * Represents helper methods used
 * @version 1.0
 * @author 
 */

var async = require('async');
var orm = require("orm");
var NotFoundError = require("../errors/NotFoundError");
var ValidationError = require("../errors/ValidationError");
var validator = require("./validator");

//exported helper
var helper = {};


/**
 * Get single non-deleted entity or return error if not found.
 * @param {String|Number} id the id of entity.
 * @param {Object} model the orm2 model definition.
 * @param {Function<err, result>} callback the callback function.
 */
helper.getSingle = function (id, model, callback) {
    model.one({id: id, isdeleted: orm.ne(true)}, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        if (!result) {
            callback(new NotFoundError(model.collectionName + " not found with id=" + id));
        } else {
            callback(null, result);
        }
    });
};

/**
 * Get all not deleted entities
 * @param {Object} model the orm2 model definition.
 * @param {Function<err, result>} callback the callback function.
 */
helper.getAll = function (model, callback) {
    model.find({isdeleted: orm.ne(true)}, callback);
};

/**
 * Get entity. It performs validation of the req.params.id.
 * @param {Object} req the express object.
 * @param {Object} req.params.id the id of entity to get
 * @param {Function<err, entity>} callback the callback function.
 */
helper.getEntity = function (req, model, callback) {
    var id = Number(req.params.id);
    var errors = validator.validateId(id);
    if (errors.length) {
        callback(new ValidationError(errors));
        return;
    }
    helper.getSingle(id, model, callback);
};

/**
 * Remove entity. It performs validation of the req.params.id.
 * @param {Object} req the express request object.
 * @param {Object} req.params.id the id of entity to get
 * @param {Function<err, entity>} callback the callback function.
 */
helper.removeEntity = function (req, model, callback) {
    var id = Number(req.params.id);
    var errors = validator.validateId(id);
    if (errors.length) {
        callback(new ValidationError(errors));
        return;
    }
    var response = { isdeleted: true, id: id };
    async.waterfall([
        function (cb) {
            //check if entity is already deleted
            model.exists({id: id, isdeleted: true}, cb);
        },
        function (exists, cb) {
            if (exists) {
                callback(null, response);
                return;
            }
            helper.getSingle(id, model, cb);
        }, function (entity, cb) {
            entity.isdeleted = true;
            entity.save(cb);
        }
    ], function (err) {
        callback(err, response);
    });
};


/**
 * Validate request data for Update or Create requests
 * @param {Object} req the express object.
 * @param {Object} req.body the body of the request, values from body will be used to create/update the entity.
 * @param {String} arrayName the name of property which contains data in req.body.
 * Create/update values are in req.body[arrayName][0]
 * @param {Object} validationSchema the validation schema used to validate the req.body data.
 * @returns {Error} validation error if invalid or null if valid
 * @private
 */
function _validateInput(req, arrayName, validationSchema) {
    var error =  validator.validateSingleArrayElement(req.body, arrayName);
    if (error) {
        return new ValidationError([error]);
    }
    var values = req.body[arrayName][0];
    var errors = validator.validateObject(validationSchema, values);
    if (errors.length) {
        return new ValidationError(errors);
    }
}

/**
 * Create entity.
 * @param {Object} req the express object.
 * @param {Object} req.body the body of the request, values from body will be used to create the entity.
 * @param {String} arrayName the name of property which contains data in req.body.
 * Create values are in req.body[arrayName][0]
 * @param {Object} model the orm2 model of entity.
 * @param {Object} validationSchema the validation schema used to validate the req.body data.
 * @param {Function<err, entity>} callback the callback function.
 */
helper.createEntity = function (req, arrayName, model, validationSchema, callback) {
    var error =  _validateInput(req, arrayName, validationSchema);
    if (error) {
        callback(error);
        return;
    }
    var values = req.body[arrayName][0];
    values.isdeleted = false;
    model.create(values, function (err, result) {
        callback(err, result, 201);
    });
};

/**
 * Update single entity.
 * @param {Object} req the express object.
 * @param {Object} req.body the body of the request, values from body will be used to update the entity.
 * @param {Object} req.params.id the id of the entity to update. req.body.id must equal to req.params.id.
 * @param {String} arrayName the name of property which contains data in req.body.
 * Create values are in req.body[arrayName][0]
 * @param {Object} model the orm2 model of entity.
 * @param {Object} validationSchema the validation schema used to validate the req.body data.
 * @param {Function<err, entity>} callback the callback function.
 */
helper.updateEntity = function (req, arrayName, model, validationSchema, callback) {
    var error =  _validateInput(req, arrayName, validationSchema);
    if (error) {
        callback(error);
        return;
    }
    var values = req.body[arrayName][0];
    async.waterfall([
        function (cb) {
            helper.getSingle(values.id, model, cb);
        }, function (entity, cb) {
            entity.save(values, cb);
        }
    ], callback);
};

module.exports = helper;