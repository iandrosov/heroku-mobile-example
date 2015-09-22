/**
 * Copyright (c) 2015 All rights reserved.
 */
"use strict";

/**
 * This file defines ValidationError.
 * This error should be used to report validation errors of input request.
 *
 * @author
 * @version 1.0
 */

/**
 * Constructor of ValidationError
 * @param {Array} errors the array of validation errors
 */
var ValidationError = function (errors) {
    //captureStackTrace
    Error.call(this);
    Error.captureStackTrace(this);
    this.message = "Validation error";
    this.errors = errors;
    this.code = 400;
};

//use Error as prototype
require('util').inherits(ValidationError, Error);

module.exports = ValidationError;
