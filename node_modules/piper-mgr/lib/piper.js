/*
 * Copyright 2015 C2G Consulting Ltd. All rights reserved.
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * 
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var request = require('request');
var _ = require('underscore');
var VERSION = "20150301";

var getHeaders = function (access_token, others) {
    return _.extend(others || {}, {
        'Authorization': 'Bearer ' + access_token,
        'Accept': 'application/vnd.piper.' + VERSION
    });
};

/**
 * Registers a new client and activates a slack connection
 * @param access_token your access token from your instance settings page
 * @param client is a JSON object according to the format in ../test/resources/piper_client.json
 * @param callback callback that takes 2 arguments err and the response body
 */
var registerClient = function (access_token, client, callback) {
    var options = {
        url: 'https://piperlabs.io/api/register',
        qs: client,
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};


/**
 * Creates a slack connection for a registered client
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var connect = function (access_token, handle, callback) {
    var options = {
        url: 'https://piperlabs.io/api/connect',
        qs: {'handle': handle},
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};


/**
 * Ends a slack connection for a registered client
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var disconnect = function (access_token, handle, callback) {
    var options = {
        url: 'https://piperlabs.io/api/disconnect',
        qs: {'handle': handle},
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};


/**
 * Retrieves the details of a registered client
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var getClient = function (access_token, handle, callback) {
    var options = {
        url: 'https://piperlabs.io/api/getclient',
        qs: {'handle': handle},
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};


/**
 * Retrieves an array of all registered clients
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var getClients = function (access_token, callback) {
    var options = {
        url: 'https://piperlabs.io/api/getclients',
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};



/**
 * Retrieves the details of an active connection for a registered client
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var getConnection = function (access_token, handle, callback) {
    var options = {
        url: 'https://piperlabs.io/api/getconnection',
        qs: {'handle': handle},
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};


/**
 * Retrieves an array of all active connections
 * @param access_token your access token from your instance settings page
 * @param handle is the unique slack handle of the clients slack instance <slackhandle>.slack.com
 * @param callback callback that takes 2 arguments err and the response body
 */
var getConnections = function (access_token, callback) {
    var options = {
        url: 'https://piperlabs.io/api/getconnections',
        json: true,
        headers: getHeaders(access_token)
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode != 200) {
            error = "Invalid response received from server: " + response.statusCode
        }
        callback(error, body);
    });
};



module.exports.registerClient = registerClient;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.getClient = getClient;
module.exports.getClients = getClients;
module.exports.getConnection = getConnection;
module.exports.getConnections = getConnections;
