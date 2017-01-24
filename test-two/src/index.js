import Logger from './helpers/logger';
import GitHubService from './services/github';
import Http from './helpers/http';

const baseUrl = "https://api.github.com/";
const organisationId = "facebook";
const gitHubApiAuthToken = ""; //add your GitHub API OAuth key here to increase request limit

let http = new Http();

let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken);

gitHubService.getUsersAndReposForOrganisation(organisationId, (error, results) => {
    if (error) {
        console.log(error);
    } else {
        results.map((user) => {
            console.log("Username: " + user.login);
        });
    }
})