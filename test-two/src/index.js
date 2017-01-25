import Logger from './helpers/logger';
import GitHubService from './services/github';
import Http from './helpers/http';
const async = require('async')
const _ = require('lodash')

const baseUrl = "https://api.github.com/";
const organisationId = "facebook";
const gitHubApiAuthToken = "fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058";
let http = new Http();
let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken);

async.waterfall(
    [
        gitHubService.getUsersForOrganisation.bind(gitHubService, organisationId),
        getRepoNamesForUserId,
        printAll
    ], (error, results) => {
        if (!error) {
            console.log('program complete')
        } else {
            console.log(error);
        }
    });

function getRepoNamesForUserId(usernamesArray, callback) {
    let asyncTasks = [];
    console.log('Fetching the repos of ' + usernamesArray.length + ' ' + organisationId + ' employee github users')
    let shortArray = usernamesArray.slice(0, 10);
    usernamesArray.forEach((user, index) => {
        let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken, user.username);
        asyncTasks.push(gitHubService.getRepoNamesForUserId.bind(gitHubService, user))
    })
    async.parallel(asyncTasks, (error, results) => {
        if (!error) {
            callback(null, results)
        } else {
            return callback(error, null)
        }
    });
}

function printAll(completeList, callback) {
    console.log(completeList);
    callback(null, null);
}
