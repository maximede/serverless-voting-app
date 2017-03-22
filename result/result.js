'use strict';

const Promise = require("bluebird");
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const DYNAMO_DB_TABLE = process.env.DYNAMODB_TABLE;

function getResultJSON(voteACount, voteBCount) {
    return {
        body: JSON.stringify(
            {
                voteACount: voteACount,
                voteBCount: voteBCount,
                totalCount: voteBCount + voteACount
            }),
        headers: {
            ContentType: "Application/json; charset=utf-8"
        },
    };
}

function getQueryForVote(vote) {
    const params = {
        TableName: DYNAMO_DB_TABLE,
        //Count: true,
        Select: "COUNT",
        FilterExpression: "#vote = :vote",
        "ExpressionAttributeNames": {
            '#vote': 'vote'
        },
        "ExpressionAttributeValues": {
            ':vote': vote,
        }
    };
    return params;
}
function getResultsFromDB(callback, vote) {

    let queryA = dynamoDb.scan(getQueryForVote("a")).promise();
    let queryB = dynamoDb.scan(getQueryForVote("b")).promise();

    Promise.all([queryA, queryB]).then(function (results) {
        console.log('queryResults from dynamo : ' + JSON.stringify(results));
        callback(null, getResultJSON(results[0].Count, results[1].Count));
    }).catch(function (error) {
        console.log('could not query db', error);
        callback(error);
    });

}

module.exports.get = (event, context, callback) => {

    getResultsFromDB(callback);

};

