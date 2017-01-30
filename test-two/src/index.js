import Logger from './helpers/logger';
import GitHubService from './services/github';
import Http from './helpers/http';
import config from '../config.json';

const baseUrl = "https://api.github.com/";
const organisationId = "uber";
const gitHubApiAuthToken = config.gitHubApiAuthToken; //add your GitHub API OAuth key here to increase request limit

let logger = new Logger();
let http = new Http();
let userList = [];
let usersWithReposList = [];

let gitHubService = new GitHubService(baseUrl, http, gitHubApiAuthToken);

gitHubService.getUsersForOrganisation(organisationId)
    .then((response) => {
        userList = response;
        logger.log(userList);
    })
    .catch((error) => {
        logger.log(error);
    })
    .then(() => {
        let getReposForUserPromises = userList.map((user) => {
            return gitHubService.getReposForUser(user.username);
        })
        Promise.all(getReposForUserPromises)
            .then((response) => {
                response.forEach((user) => {
                    usersWithReposList.push(user);
                })
            })
            .catch((error) => {
                logger.log(error);
            })
            .then(() => {
                logger.log(usersWithReposList);
            })
    })
    .catch((error) => {
        logger.log(error);
    })



