'use strict';

const Couchbase = require('couchbase');
const util = require('util');
const uuid = require('uuid');
const Joi = require('joi');
const $q = require('bluebird');
const _ = require('lodash');
const SearchQuery = Couchbase.SearchQuery,
  SearchFacet = Couchbase.SearchFacet,
  N1qlQuery = Couchbase.N1qlQuery,
  MatchQuery = Couchbase.MatchQuery;
const denialAgencies = require('./denialagencies');

var cluster = new Couchbase.Cluster('couchbase://100.24.37.195');
cluster.authenticate('the_gauth', '4y8xs#7Cnk');
var bucket = cluster.openBucket('dp');

bucket.queryPromise = $q.promisify(bucket.query);
bucket.upsertPromise = $q.promisify(bucket.upsert);

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
  bucket.insert(id, data, (error, result) => {
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
      body: JSON.stringify(result)
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
      body: JSON.stringify(result)
    };
    callback(null, response);
  });
};

module.exports.dpaddresssearch = (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  var response = {}, data = JSON.parse(event.body);

  // two-part search like name search, searching over the address fields; create a separate address index for this.
  var addressAndCity = [data.address, data.city].join(' ').toUpperCase().replace(/[^A-Z0-9 ]*/g, '');

  var addressQuery = SearchQuery.new('entity_address', SearchQuery.match(addressAndCity));
  addressQuery.fields('country');

  var resultSets = [], queries = [addressQuery];
  var country = data.country && data.country.toUpperCase();

  console.log(data);
  console.log(data.country);
  console.log(country);

  var resultPacker = function(result) {
    resultSets.push(result);
    if (resultSets.length == queries.length) {
      response = {
        statusCode: 200,
        body: JSON.stringify(resultSets)
      };
      callback(null, response);
    }
  };

  var errorHandler = function(error) {
    if (!response.statusCode) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          message: error.message
        })   
      };
      return callback(null, response);
    }
  };

  bucket.queryPromise(addressQuery)
    .then(function(results) {
      if (country) _.remove(results, function(result) { return result.fields.country !== country && result.fields.country !== 'XX'; });
      return $q.map(results, function(record) {
        return bucket.queryPromise(N1qlQuery.fromString('select name, address_1, address_2, city, state, country, start_Date, last_update, denial_Code, denial_references from dp where META().id = \'' + record.id + '\''))
          .then(function(singleResult) {
            return {
              score: record.score,
              name: singleResult[0].name,
              denial_agency: denialAgencies[singleResult[0].denial_Code],
              address_1: singleResult[0].address_1,
              address_2: singleResult[0].address_2,
              city: singleResult[0].city,
              state: singleResult[0].state,
              country: singleResult[0].country,
              start_date: singleResult[0].start_Date,
              last_update: singleResult[0].last_Update,
              denial_references: singleResult[0].denial_references
            };
          });
      });
    })
    .then(function(results) {
      var id = 'exitsinc:dp:lambda_test:search:' + _.replace(uuid(), /-/g, '');
      data.type = 'addresssearch';
      return bucket.upsertPromise(id, data).then(function() { return results; });
    })
    .then(resultPacker)
    .catch(errorHandler);

};


var doNameSearch = function(firstName, lastName, companyName, country, reverseOnly) {

  var isSimilarQuery, names;
  if (firstName || lastName) {
    firstName = (firstName || '').toUpperCase().replace(/[^A-Z0-9 ]*/g, '');
    lastName = (lastName || '').toUpperCase().replace(/[^A-Z0-9 ]*/g, '');
    var for_name = firstName + ' ' + lastName;
    var rev_name = lastName + ', ' + firstName;
    names = [for_name, rev_name];

    isSimilarQuery = SearchQuery.new('entity_name_fulltext', SearchQuery.match(for_name));
    isSimilarQuery.fields("name", "country", "start_Date", "last_Update", "denial_Code", "denial_references");
  } else {
    companyName = (companyName || ' ').toUpperCase().replace(/[^A-Z0-9 ]*/g, '');
    names = [companyName];
    isSimilarQuery = SearchQuery.new('entity_name_fulltext', SearchQuery.match(companyName));
    isSimilarQuery.fields("name", "country", "start_Date", "last_Update", "denial_Code", "denial_references");
  }

  return bucket.queryPromise(isSimilarQuery)
  .then(function(results) {
    if (country) _.remove(results, function(result) { return result.fields.country !== country && result.fields.country !== 'XX'; });
    return $q.map(results, function(record) {
      return bucket.queryPromise(N1qlQuery.fromString('select name, address_1, address_2, city, state, country, start_Date, last_update, denial_Code, denial_references, includeReverse from dp where META().id = \'' + record.id + '\''))
        .then(function(singleResult) {
          return {
            score: record.score,
            name: singleResult[0].name,
            denial_agency: denialAgencies[singleResult[0].denial_Code],
            address_1: singleResult[0].address_1,
            address_2: singleResult[0].address_2,
            city: singleResult[0].city,
            state: singleResult[0].state,
            country: singleResult[0].country,
            start_date: singleResult[0].start_Date,
            last_update: singleResult[0].last_Update,
            denial_references: singleResult[0].denial_references,
            includeReverse: singleResult[0].includeReverse
          };
        });
    });
  })
  .then(function(results) {
    if (reverseOnly) console.log(results.length.toString() + ' results before reverse filtering');
    results = _.filter(results, function(result) { return !reverseOnly || result.includeReverse; });
    if (reverseOnly) console.log(results.length.toString() + ' results after reverse filtering');
    // Does this need to be a promise?
    var isMatches = _.map(_.remove(results, function(result) { return _.some(names, function(name) { return result.name === name; });}), function(item) { return _.omit(item, ['score']);});
    var containsMatches = _.map(_.remove(results, function(result) { return _.some(names, function(name) { _.includes(result.name, name); }); }), function(item) { return _.omit(item, ['score'])});
    var similarMatches = results;
    return {
      matchCount: isMatches.length + containsMatches.length + similarMatches.length,
      is: isMatches,
      contains: containsMatches,
      similar: similarMatches
    };
  });

};


module.exports.reversesearch = (event, context, callback) => {
  // Load past name searches
  context.callbackWaitsForEmptyEventLoop = false;

  var pastNameSearchesN1ql = 'select firstName, lastName, companyName from dp where type = \'namesearch\' group by firstName, lastName, companyName';
  bucket.queryPromise(N1qlQuery.fromString(pastNameSearchesN1ql))
    .then(function(pastSearches) {
    // Got the past searches, re-execute them on reverseSearch=true entities only.
    // This may require re-inserting reverse search entities into their own type.
    
    var reverseSearchResults = [], searchCount = 0;
    console.log('past search count = ' + pastSearches.length.toString());

    var responseHandler = function() {
      console.log('checking response... ' + searchCount.toString() + ' to ' + pastSearches.length.toString());
      if (searchCount === pastSearches.length) {
        // done getting results, send it all back?
        var response = {
          statusCode: 200,
          body: JSON.stringify( { count: reverseSearchResults.length, hits: reverseSearchResults } )
        };
        console.log('executing callback');
        return callback(null, response);
      }
    };

    _.map(pastSearches, function(pastSearch) {

      doNameSearch(pastSearch.firstName, pastSearch.lastName, pastSearch.companyName, null, true)
      .then(function(results) {
        searchCount++;
        console.log('Search ' + searchCount.toString() + ' complete: ' + JSON.stringify(results));
        if (results.matchCount) {
          console.log('Reverse search hits found');
          pastSearch.reverseSearchResults = results;
          reverseSearchResults.push(pastSearch);
        }
        return searchCount;
      })
      .then(responseHandler);
    });

  })

};


module.exports.dpnamesearch = (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  var response = {};

  var data = JSON.parse(event.body);

  doNameSearch(data.firstName, data.lastName, data.companyName, data.country)
  .then(function(results) {
    var id = 'exitsinc:dp:lambda_test:search:' + _.replace(uuid(), /-/g, '');
    data.type = 'namesearch';
    data.firstName = data.firstName && data.firstName.toUpperCase();
    data.lastName = data.lastName && data.lastName.toUpperCase();
    data.companyName = data.companyName && data.companyName.toUpperCase();
    data.country = data.country && data.country.toUpperCase();
    data.results = results;
    return bucket.upsertPromise(id, data).then(function() { return results; });
  })
  .then(function(result) {
    response = {
      statusCode: 200,
      body: JSON.stringify(result)
    };
    callback(null, response);
  })
  .catch(function(error) {
    if (!response.statusCode) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          code: error.code,
          message: error.message
        })   
      };
      return callback(null, response);
    }
  });

};
