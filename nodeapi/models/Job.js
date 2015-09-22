/***
 * Copyright (C) 2015., All Rights Reserved.
 */
"use strict";

/**
 * Represents Job model, table svc_job__c in database
 * @version 1.0
 * @author AI
 */

var config = require("../config/configuration");


module.exports = {
    /**
     * Initialize the model Job in the database
     * @param {Object} db the orm2 database instance
     * @param {Function<err, Job>} callback the callback function
     */
    init: function (db, callback) {
        var Job = db.define(config.database.schema + '.svc_job__c', {
            job_end_time__c: {type: "date"},
            createddate: {type: "date"},
            job_start_time__c: {type: "date"},
            longitude__c: {type: "number", size: 8},
            latitude__c: {type: "number", size: 8},
            contact_name__c: {type: "text", size: 1300},
            isdeleted: {type: "boolean"},
            lastmodifieddate:  {type: "date"},
            client_contact__c: {type: "text", size: 18},
            client_name__c: {type: "text", size: 1300},
            job_name__c: {type: "text", size: 100},
            sfid: {type: "text", size: 18},
            client_account__c: {type: "text", size: 18},
            job_address__c: {type: "text", size: 200},
            notes__c: {type: "text", big: true},
            info_text__c: {type: "text", size: 255},
            name: {type: "text", size: 80},
            status__c: {type: "text", size: 255},
            phone__c: {type: "text", size: 40},
            picture_s3_url__c: {type: "text", size: 255}
        });
        Job.collectionName = "Job";
        db.models.Job = Job;
        callback(null, Job);
    }
};