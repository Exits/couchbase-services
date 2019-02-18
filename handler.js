'use strict';

/*
 * replace farts with standard function syntax
 * optimize const and vars to one each
 * reduce module.exports to return a an object containing references to each function
 * reformat the dynamic strings using node util.format function
 * build a standard response function
 * build a validation service
 */

const Couchbase = require("couchbase"),
  UUID = require("uuid"),
  Joi = require("joi");

var cluster = new Couchbase.Cluster("couchbase://ip address to any cb");
cluster.authenticate("username here", "password here");
var bucket = cluster.openBucket("dp");

bucket.on("error", error => {
  console.dir(error);
});
/*
{
  "firstname": "Benjamin",
  "lastname": "Samples",
  "type": "person"
}
*/
module.exports.create = (event, context, callback) => {
  // change how the function waits to respond.
  context.callbackWaitsForEmptyEventLoop = false;
  var schema = Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    type: Joi.string().forbidden().default("person")
  });
  var data = JSON.parse(event.body);
  var response = {};


  var validation = Joi.validate(data, schema);

  // if the model submitted is invalid, smack 'em upside they head
  if (validation.error) {
    // format the error response to make lambda happy (statusCode and body required)
    response = {
      statusCode: 500,
      body: JSON.stringify(validation.error.details)
    };
    return callback(null, response);
  }
  var id = UUID.v4();
  bucket.insert(id, validation.value, (error, result) => {
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
    data.id = id;
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
  var statement = "SELECT META().id, `" + bucket._name + "`.* FROM `" + bucket._name + "` WHERE type = 'person'";
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
  // in this case, read the id from the path parameters (uri/url)
  var builder = bucket.mutateIn(event.pathParameters.id);
  if (data.firstname) {
    builder.replace("firstname", data.firstname);
  }
  if (data.lastname) {
    builder.replace("lastname", data.lastname);
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
