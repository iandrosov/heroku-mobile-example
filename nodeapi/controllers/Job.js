/**
 * Copyright (C) 2015 , All Rights Reserved.
 */
"use strict";

/**
 * Represents controller for Job model
 * @version 1.0
 * @author AI
 */

var wrapExpress = require("../helpers/logging").wrapExpress;
var helper = require("../helpers/helper");

/**
 * response will be wrapped in object {jobs: <result>}
 */
var WRAPPED_PROPERTY_NAME = "jobs";

/**
 * Show all jobs.
 * @param {Object} db the orm2 database instance
 * @param {Function<err, result>} callback the callback function
 */
function index(db, callback) {
    helper.getAll(db.models.Job, callback);
}

/**
 * Show a job.
 * @param {Object} req the express request
 * @param {Object} db the orm2 database instance
 * @param {Function<err, result>} callback the callback function
 */
function show(req, db, callback) {
    helper.getEntity(req, db.models.Job, callback);
}

/**
 * Create a job.
 * @param {Object} req the express request
 * @param {Object} db the orm2 database instance
 * @param {Function<err, result>} callback the callback function
 */
function create(req, db, callback) {
    var definition = {
        job_name__c: {type: "string", length: 100, required: true},
        job_address__c: {type: "string", length: 200, required: true},
        info_text__c: {type: "string", length: 255},
        client_contact__c: {type: "string", length: 18},
        contact_name__c: {type: "string", length: 1300},
        client_name__c: {type: "string", length: 1300},
        client_account__c: {type: "string", length: 18},
        phone__c: {type: "string", length: 40, required: true}
    };
    helper.createEntity(req, WRAPPED_PROPERTY_NAME, db.models.Job, definition, callback);
}

/**
 * Update a job.
 * @param {Object} req the express request
 * @param {Object} db the orm2 database instance
 * @param {Function<err, result>} callback the callback function
 */
function update(req, db, callback) {
    var definition = {
        job_start_time__c: {type: "datetime"},
        job_end_time__c: {type: "datetime"},
        status__c: {type: "enum", values: ["New", "In Progress", "Complete"]},
        notes__c: {type: "string", size: 32000},
        info_text__c: {type: "string", size: 255},
        job_address__c: {type: "string", size: 200, optionalRequired: true},
        phone__c: {type: "string", size: 40, optionalRequired: true},
        job_name__c: {type: "string", size: 100, optionalRequired: true},
        id: {type: "id", required: true}
    };
    helper.updateEntity(req, WRAPPED_PROPERTY_NAME, db.models.Job, definition, callback);
}

/**
 * Remove a job.
 * @param {Object} req the express request
 * @param {Object} db the orm2 database instance
 * @param {Function<err, result>} callback the callback function
 */
function remove(req, db, callback) {
    helper.removeEntity(req, db.models.Job, callback);
}

module.exports = {
    index: wrapExpress("Job#index", index, WRAPPED_PROPERTY_NAME),
    show: wrapExpress("Job#show", show, WRAPPED_PROPERTY_NAME),
    create: wrapExpress("Job#create", create, WRAPPED_PROPERTY_NAME),
    update: wrapExpress("Job#update", update, WRAPPED_PROPERTY_NAME),
    remove: wrapExpress("Job#remove", remove, WRAPPED_PROPERTY_NAME)
}