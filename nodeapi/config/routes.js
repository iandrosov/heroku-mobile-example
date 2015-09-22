/**
 * Copyright (C) 2015., All Rights Reserved.
 */
"use strict";

/**
 * Represents express routes
 * Multiple versions are supported. Each route is prefixed with version e.g. "/1.0/accounts"
 * Declaration for route has format:
 * "HTTP_VERB ROUTE": "CONTROLLER_NAME#METHOD_NAME"
 * @version 1.0
 * @author 
 */

module.exports = {
    "1.0": {

        "GET /jobs": "Job#index",
        "GET /jobs/:id": "Job#show",
        "POST /jobs": "Job#create",
        "PUT /jobs/:id": "Job#update",
        "DELETE /jobs/:id": "Job#remove"

    }
};