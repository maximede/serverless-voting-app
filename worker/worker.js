'use strict';

const Promise = require("bluebird");
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const DYNAMO_DB_TABLE = process.env.DYNAMODB_TABLE;

function saveVoteToDB(callback, vote) {
    // DynamodDB will replace a document if we ```put``` a document with the same hash
    const params = {
        TableName: DYNAMO_DB_TABLE,
        Item: {
            "id": vote.voterId,
            "vote": vote.vote,
        },
    };

    dynamoDb.put(params).promise().then(function () {
        console.log( 'saved new vote for ' + vote.voterId);
        callback(null, 'saved new vote for' + vote.voterId);
    }).catch(function (error) {
        console.log('could not save to dynamodb', error);
        callback(new Error(error));
    })

}

module.exports.saveVote = (event, context, callback) => {

    console.trace('event : ' + JSON.stringify(event));

    const vote = JSON.parse(event.Records[0].Sns.Message);

    console.trace('vote : ' + JSON.stringify(vote));

    console.trace('voterId : ' + vote.voterId);

    saveVoteToDB(callback, vote);

};

