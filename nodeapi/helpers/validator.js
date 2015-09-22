/**
 * Copyright (C) 2015 All Rights Reserved.
 */
"use strict";

/**
 * Represents validation methods
 * @version 1.0
 * @author
 */

var _ = require('underscore');
var moment = require('moment');

//max integer in database
var MAX_INT = 2147483647;
var EMAIL_REG = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Represents the map with error codes.
 * codes 1000 - 1999 are validation errors.
 * code 404 is reserved for NotFoundError
 * code 400 is reserved for general bad request error (invalid json format)
 * code 500 is reserved for internal server error
 */
var ERRORS = {
    //validation errors
    MISSING_FIELD: {
        code: 1000,
        message: "Missing field",
        field: "field name"
    },
    NULL_VALUE: {
        code: 1001,
        message: "Null value is not allowed",
        field: "field name"
    },
    INVALID_INPUT: {
        code: 1002,
        message: "Input body must be an object"
    },
    INVALID_INPUT_ARRAY: {
        code: 1003,
        message: "Request data must be wrapped inside '{0}' array and it must contain only one element"
    },
    //string errors
    EXPECTED_STRING: {
        code: 1100,
        message: "String value expected",
        field: "field name"
    },
    EMPTY_OR_SPACES_STRING: {
        code: 1101,
        message: "String value cannot be empty or contain only spaces",
        field: "field name"
    },
    MAX_LENGTH: {
        code: 1102,
        message: "String is too long",
        field: "field name",
        max_length: -1
    },
    INVALID_EMAIL: {
        code: 1103,
        message: "Value is not valid email address",
        field: "field name"
    },
    INVALID_DATETIME: {
        code: 1104,
        message: "Invalid date time format. Expected format: YYYY-MM-DD HH:mm:ss. " +
            "See for reference http://momentjs.com/docs/#/parsing/string-format/",
        field: "field name"
    },
    INVALID_DATE: {
        code: 1105,
        message: "Invalid date format. Expected format: YYYY-MM-DD. " +
            "See for reference http://momentjs.com/docs/#/parsing/string-format/",
        field: "field name"
    },
    INVALID_ENUM: {
        code: 1106,
        message: "Invalid enum value. Value must be one of the allowed_values",
        field: "field name",
        allowed_values: []
    },
    //numeric errors
    EXPECTED_NUMBER: {
        code: 1200,
        message: "Number value expected",
        field: "field name"
    },
    EXPECTED_INTEGER: {
        code: 1201,
        message: "Integer value expected",
        field: "field name"
    },
    INVALID_ID: {
        code: 1202,
        message: "Database ID expected (Integer value. Range from 1 to 2147483647)",
        field: "field name"
    }
};

/**
 * Check if input parameter is valid number.
 * @param {Number | String} number the number to check
 * @private
 * @return {Boolean} true if valid, false if invalid
 */
function _isValidNumber(number) {
    return _.isNumber(number) && !_.isNaN(number) && isFinite(number);
}

/**
 * Check if input parameter is valid integer.
 * @param {Number} number the number to check
 * @private
 * @return {Boolean} true if valid, false if invalid
 */
function _isValidInteger(number) {
    return _isValidNumber(number) && number % 1 === 0;
}

/**
 * Check if input parameter is valid database id.
 * @param {Number} number the id to check
 * @private
 * @return {Boolean} true if valid, false if invalid
 */
function _isValidId(number) {
    return _isValidInteger(number) && number > 0 && number <= MAX_INT;
}

/**
 * Validate object if matches given definition (validation schema).
 * The definition object has following format:
 * {
 *   propertyA: {type: "expectedType", fieldA: "valueA"},
 *   propertyB: {type: "expectedType", fieldB: "valueB"},
 * }
 * propertyA defines validation rule for obj.propertyA
 * propertyB defines validation rule for obj.propertyB
 * fieldA defines extra setting for validation (e.g. max string length)
 * etc.
 * allowed types:
 * - string (by default strings can be empty or whitespace; set empty=false to disallow empty string;
 *   set length=XX to set max length of string; set email=true to validate email address)
 * - number
 * - integer
 * - id (database id)
 * - enum (set 'values' to specify allowed enum values, example {type: "enum", values: ["valA", "valB", "valC"]}
 * - date (must be string in format YYYY-MM-DD)
 * - datetime (must be string in format YYYY-MM-DD HH:mm:ss)
 *
 * By default null values are acceptable, specify nullable=false to disallow nulls.
 * The Id type is not nullable by default.
 *
 * Specify required=true to make field required (can't be null or empty or undefined).
 * Specify optionalRequired=true to make field nullable=false, empty=false and optional. This can be used when field
 * is required in CREATE, but optional in UPDATE
 *
 * @param {Object} definition the object expected definition
 * @param {Object} obj the object to validate, extra properties will be removed
 * @returns {Array} the array of errors if there was validation issues
 */
function validateObject(definition, obj) {
    if (!_.isObject(obj) || _.isArray(obj)) {
        return [_.clone(ERRORS.INVALID_INPUT)];
    }
    var allowedFields = _.keys(definition),
        missingFields = _.difference(allowedFields, _.keys(obj)),
        errors = [],
        notNullableTypes = ["id"],//types that can't be null by default
        prop,
        date,
        addError;
    //remove extra properties
    for (prop in obj) {
        if (obj.hasOwnProperty(prop) && !definition.hasOwnProperty(prop)) {
            delete obj[prop];
        }
    }
    //add error to errors array
    addError = function (err, fieldName, props) {
        var error = _.clone(err);
        if (props) {
            error = _.extend(error, props);
        }
        if (fieldName) {
            error.field = fieldName;
        }
        errors.push(error);
    };
    missingFields.forEach(function (fieldName) {
        if (definition[fieldName].required) {
            addError(ERRORS.MISSING_FIELD, fieldName);
        }
    });
    //for each field perform validation
    _.keys(definition).forEach(function (fieldName) {
        if (!obj.hasOwnProperty(fieldName)) {
            return;
        }
        var def = definition[fieldName],
            value = obj[fieldName];
        //add error to the result
        var setError = function (err, props) {
            addError(err, fieldName, props);
        };
        //by default we allow nulls
        if (value === null && (def.required || def.nullable === false || def.optionalRequired ||
            notNullableTypes.indexOf(def.type) !== -1)) {
            return setError(ERRORS.NULL_VALUE);
        }
        if (value === null) {
            return;
        }
        if (['number', 'integer', 'id'].indexOf(def.type) !== -1) {
            //convert value always to Number type
            //if not number then it will be NaN
            obj[fieldName] = value = Number(value);
        }
        switch (def.type) {
        case "string":
            if (!_.isString(value)) {
                return setError(ERRORS.EXPECTED_STRING);
            }
            if (def.length && value.length > def.length) {
                return setError(ERRORS.MAX_LENGTH, {max_length: def.length});
            }
            if (value.trim().length === 0 && (def.empty === false || def.required || def.optionalRequired)) {
                return setError(ERRORS.EMPTY_OR_SPACES_STRING);
            }
            if (def.email) {
                if (!EMAIL_REG.test(value)) {
                    return setError(ERRORS.INVALID_EMAIL);
                }
            }
            break;
        case "number":
            if (!_isValidNumber(value)) {
                return setError(ERRORS.EXPECTED_NUMBER);
            }
            break;
        case "integer":
            if (!_isValidInteger(value)) {
                return setError(ERRORS.EXPECTED_INTEGER);
            }
            break;
        case "id":
            if (!_isValidId(value)) {
                return setError(ERRORS.INVALID_ID);
            }
            break;
        case "datetime":
            date = moment.utc(value, "YYYY-MM-DD HH:mm:ss", true);
            if (!date.isValid()) {
                return setError(ERRORS.INVALID_DATETIME);
            }
            obj[fieldName] = date.toDate();
            break;
        case "date":
            date = moment.utc(value, "YYYY-MM-DD", true);
            if (!date.isValid()) {
                return setError(ERRORS.INVALID_DATE);
            }
            obj[fieldName] = date.toDate();
            break;
        case "enum":
            if (def.values.indexOf(value) === -1) {
                return setError(ERRORS.INVALID_ENUM, {allowed_values: def.values});
            }
            break;
        default:
            throw new Error("Unknown type: " + def.type);
        }
    });
    return errors;
}

/**
 * Validate the database id
 * @param {Number} id the id to validate
 * @return {Array} the array with error if input is invalid or empty array if valid
 */
function validateId(id) {
    if (_isValidId(id)) {
        return [];
    }
    var error = ERRORS.INVALID_ID;
    error = _.clone(error);
    error.field = "id";
    return [error];
}

/**
 * Check if obj[propertyName] is array and contains exactly one element
 * @param {Object} obj the wrapped object
 * @param {String} propertyName the property name
 * @returns {Error} the error if obj is invalid or null if valid
 */
function validateSingleArrayElement(obj, propertyName) {
    var error = _.clone(ERRORS.INVALID_INPUT_ARRAY);
    error.message = error.message.replace('{0}', propertyName);
    if (!_.isObject(obj) || !_.isArray(obj[propertyName]) || obj[propertyName].length !== 1) {
        return error;
    }
    return null;
}

module.exports = {
    validateObject: validateObject,
    validateId: validateId,
    ERRORS: ERRORS,
    validateSingleArrayElement: validateSingleArrayElement
};