'use strict';

/*
 * replace farts with standard function syntax
 * optimize const and vars to one each
 * reduce module.exports to return a an object containing references to each function
 * reformat the dynamic strings using node util.format function
 * build a standard response function
 * build a validation service
 */

const Couchbase = require('couchbase'),
  util = require('util'),
  UUID = require('uuid'),
  Joi = require('joi');

var cluster = new Couchbase.Cluster('couchbase://100.24.37.195');
cluster.authenticate('the_gauth', '4y8xs#7Cnk');
var bucket = cluster.openBucket('dp');

bucket.on('error', error => {
  console.dir(error);
});

const mk_parsed = Joi.object().keys({
    lineNo: Joi.number().integer().required(),
    entity_Id: Joi.number().integer().required(),
    name: Joi.string().allow(''),
    address_1: Joi.string().allow(''),
    address_2: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    start_Date: Joi.date().iso().allow(null),
    end_Date: Joi.date().iso().allow(null),
    denial_Code: Joi.string().allow(''),
    last_Update: Joi.date().iso().allow(null),
    first_vol: Joi.number().integer().allow(null),
    first_page: Joi.number().integer().allow(null),
    first_date: Joi.date().iso().allow(null),
    second_vol: Joi.number().integer().allow(null),
    second_page: Joi.number().integer().allow(null),
    second_date: Joi.date().iso().allow(null),
    third_vol: Joi.number().integer().allow(null),
    third_page: Joi.number().integer().allow(null),
    third_date: Joi.date().iso().allow(null),
    fourth_vol: Joi.number().integer().allow(null),
    fourth_page: Joi.number().integer().allow(null),
    fourth_date: Joi.date().iso().allow(null),
    fifth_vol: Joi.number().integer().allow(null),
    fifth_page: Joi.number().integer().allow(null),
    fifth_date: Joi.date().iso().allow(null),
    sixth_vol: Joi.number().integer().allow(null),
    sixth_page: Joi.number().integer().allow(null),
    sixth_date: Joi.date().iso().allow(null),
    seventh_vol: Joi.number().integer().allow(null),
    seventh_page: Joi.number().integer().allow(null),
    seventh_date: Joi.date().iso().allow(null),
    eighth_vol: Joi.number().integer().allow(null),
    eighth_page: Joi.number().integer().allow(null),
    eighth_date: Joi.date().iso().allow(null)
  }),// first phase parse
  mk_raw = Joi.object().keys({
    lineNo: Joi.number().integer().required(),
    entity_Id: Joi.number().integer().required(),
    raw: Joi.string(),
  });

module.exports.create = (event, context, callback) => {
  // change how the function waits to respond.
  context.callbackWaitsForEmptyEventLoop = false;
  var data = JSON.parse(event.body);
  var response = {};

  // var validation = Joi.validate(data, mk_raw);

  // // if the model submitted is invalid, smack 'em upside they head
  // if (validation.error) {
  //   // format the error response to make lambda happy (statusCode and body required)
  //   response = {
  //     statusCode: 400,
  //     body: JSON.stringify(validation.error.details)
  //   };
  //   return callback(null, response);
  // }
  if (!(data.lineNo || data.entity_Id)) {
    // format the error response to make lambda happy (statusCode and body required)
    response = {
      statusCode: 400,
      body: JSON.stringify({
        code: error.code,
        message: 'lineNo and entity_Id must have a value'
      })
    };
    return callback(null, response);
  }
  var id = util.format('exitsinc:dp:develop:import:line:%i:entity_id:%i', data.lineNo, data.entity_Id);
  bucket.insert(data.id, data, (error, result) => {
    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          message: error.message
        })
      };
      return callback(null, response);
    }

    response = {
      statusCode: 201,
      body: JSON.stringify(data)
    };
    callback(null, response);
  });
};

module.exports.retrieve = (event, context, callback) => {
  // use N1QL to query for all documents in Couchbase and return them.

  // change how the function waits to respond.
  context.callbackWaitsForEmptyEventLoop = false;
  var response = {};
  var statement = util.format("SELECT META().id, %s.* FROM %s limit %i offset %i", bucket._name, bucket._name, event.queryStringParameters.limit, event.queryStringParameters.offset);
  var query = Couchbase.N1qlQuery.fromString(statement);
  bucket.query(query, (error, result) => {
    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          message: error.message
        })
      };
      return callback(null, response);
    }
    response = {
      statusCode: 200,
      body: JSON.stringify(result)
    };
    callback(null, response);
  });
};

module.exports.update = (event, context, callback) => {

  // change how the function waits to respond.
  context.callbackWaitsForEmptyEventLoop = false;
  var schema = Joi.object().keys({
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional()
  });
  var data = JSON.parse(event.body);
  var response = {};

  // ensure the request is valid
  var validation = Joi.validate(data, schema);
  if (validation.error) {
    response = {
      statusCode: 500,
      body: JSON.stringify(validation.error.details)
    };
    return callback(null, response);
  }

  // create a mutation builder based on the information found in the request.
  // that is, build the update around the keys provided to be modified
  // in this case, read the urn from the path parameters (uri/url)
  var builder = bucket.mutateIn(event.pathParameters.id);
  if (data.firstname) {
    builder.replace('firstname', data.firstname);
  }
  if (data.lastname) {
    builder.replace('lastname', data.lastname);
  }
  builder.execute((error, result) => {
    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          message: error.message
        })
      };
      return callback(null, response);
    }
    response = {
      statusCode: 200,
      body: JSON.stringify(data)
    };
    callback(null, response);
  });
};

module.exports.delete = (event, context, callback) => {

  // change how the function waits to respond.
  context.callbackWaitsForEmptyEventLoop = false;
  var schema = Joi.object().keys({
    id: Joi.string().required()
  });
  var data = JSON.parse(event.body);
  var response = {};

  // ensure the request is valid
  var validation = Joi.validate(data, schema);
  if (validation.error) {
    response = {
      statusCode: 500,
      success: false,
      body: JSON.stringify(validation.error.details)
    };
    return callback(null, response);
  }
  bucket.remove(data.id, (error, result) => {
    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          success: false,
          message: error.message
        })
      };
      return callback(null, response);
    }
    response = {
      statusCode: 200,
      success: true,
      message: util.format('%s successfully removed.'),
      body: JSON.stringify(data)
    };
    callback(null, response);
  });
};
