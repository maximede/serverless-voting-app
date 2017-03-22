'use strict';

const Promise = require("bluebird");
const AWS = require('aws-sdk');
const cuid = require('cuid');
const mustache = require('mustache');
const readFile = Promise.promisify(require("fs").readFile);

const sns = new AWS.SNS();

const voterIdCookieName = "voter-id";

const snsTopicARN = process.env['SNS_TOPIC_ARN'];


module.exports.get = (event, context, callback) => {
    let voter_id = getVoterId(event);
    let cookieString = createVoterIdCookie(voter_id);

    let params = getTemplateParams(voter_id, null);

    returnTemplate(params, cookieString, callback);

};
module.exports.post = (event, context, callback) => {

    console.trace('event : ' + JSON.stringify(event));

    let voter_id = getVoterId(event);
    let cookieString = createVoterIdCookie(voter_id);
    let vote = event.body.vote;

    sendVoteToSNS(voter_id, vote)
        .then(result => {
            console.log(JSON.stringify(result));
            let templateParams = getTemplateParams(voter_id, vote);

            returnTemplate(templateParams,cookieString, callback);
        }).catch(error => {
        console.log(error);
        callback(error, {
            body: "<html><body>" + JSON.stringify(error) +
                  "</body></html>",
            Cookie: cookieString,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required
                                                    // for CORS
                                                    // support
                                                    // to work
                "Access-Control-Allow-Credentials": true // Required
                                                         // for
                                                         // cookies,
                                                         // authorization
                                                         // headers
                                                         // with
                                                         // HTTPS
            },
        });
    })
};

function sendVoteToSNS(voter_id, vote) {

    let params = {
        Message: "{ \"voterId\" : \"" + voter_id + "\", \"vote\" : \"" + vote + "\"}",
        TopicArn: snsTopicARN
    };

    console.log("sending : " + JSON.stringify(params) + " to " + snsTopicARN);

    try {
        return sns.publish(params).promise();
    } catch (e) {
        console.log("error calling sns  " + JSON.stringify(e));
    }
}

function getTemplateParams(voter_id, vote) {
    let template_params = {
        voter_id: voter_id,
        option_a: "Cats",
        option_b: "Dogs",
    };
    if (typeof vote !== 'undefined') {
        template_params['vote'] = vote
    }

    console.log("vote was : " + vote + ". Params were : " + JSON.stringify(template_params));

    return template_params;
}
function returnTemplate(params, cookieString, callback) {

    readFile("./vote/templates/index.html").then(data => {
        let output = mustache.render(data.toString(), params);
        callback(null, {
            body: output,
            Cookie: cookieString,
            headers: {
                ContentType: "text/html; charset=utf-8"
                //"Access-Control-Allow-Origin": "*", // Required for CORS support to work
                //"Access-Control-Allow-Credentials": true // Required for cookies, authorization
                // headers with HTTPS
            },
        });
    });
}


function getVoterId(event) {
    let voter_id;

    if (event.hasOwnProperty('headers') &&
        event.headers.hasOwnProperty('Cookie')) {

        let cookies = event.headers.Cookie;
        console.trace('found cookie header with value ' + cookies);
        let cookie_string = getCookie(voterIdCookieName, cookies);
        console.trace('found cookie with value ' + cookie_string);
        voter_id = cookie_string;

    }
    if (!voter_id) {
        voter_id = cuid();
    }
    return voter_id;
}
function createVoterIdCookie(voter_id) {

    let cookieString = voterIdCookieName + "=" + voter_id;

    let date = new Date();
    date.setTime(+date + (365 * 86400000)); //24 \* 60 \* 60 \* 100
    cookieString = cookieString + "; " + "expires=" + date.toUTCString() + ";";
    return cookieString;
}

function getCookie(name, cookies) {
    const value = "; " + cookies;
    const parts = value.split("; " + name + "=");
    if (parts.length >= 2) {
        return parts.pop().split(";").shift();
    }
}