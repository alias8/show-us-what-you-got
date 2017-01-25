import Logger from './helpers/logger';
import GitHubService from './services/github';
import Http from './helpers/http';
const async = require('async')
const _ = require('lodash')

const baseUrl = "https://api.github.com/";
const organisationId = "facebook";
const gitHubApiAuthToken = "fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058";

let http = new Http();
let userNames = [];
let testArray = [{ username: "3lvis", id: 0 }];

let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken);
gitHubService.getUsersForOrganisation(organisationId, (error, results) => {
    if (error) {
        console.log(error);
    } else {
        userNames = results;
        console.log('usernames retreived');
        userNames.forEach((user, index) => {
            let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken);
            gitHubService.getRepoNamesForUserId(user, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    let a = user;
                    let b = _.find(userNames, (o) => {
                        return o.username === user.username;
                    });
                    b.repos = results;
                    console.log(b);
                }
            })
        })
        //print();
    }
})

function print() {
    userNames.forEach((value, index) => {
        console.log(value.username);
        console.log(value.repos)
        console.log('')
    })
}

