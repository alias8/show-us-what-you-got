const async = require('async')
const _ = require('lodash')

class GitHubService {
    constructor(baseUrl, http, apiAuthenticationToken, username) {
        this.username = username || 'none';
        this.baseUrl = baseUrl;
        this.http = http;
        this.apiAuthenticationToken = apiAuthenticationToken;
        this.authenticationQueryString = "";
        if (this.apiAuthenticationToken !== "") {
            this.authenticationQueryString = "?access_token=" + this.apiAuthenticationToken;
        }
        this.urlsToQuery = [];
    }

    /**
     * Returns array of paginated urls with format similar to 
     * "https://api.github.com/orgs/facebook/members?access_token=fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058&page=2".
     */
    getAllPaginatedForURL(url, callback) {
        let self = this;
        this.http.get(url, (error, results) => {
            if (!error) {
                if (results.headers.link) { // multiple pages
                    let myRe = new RegExp(/page=(\d+)>; rel="last"/, "g");
                    let finalPage = Number(myRe.exec(results.headers.link)[1]);
                    let urlsToQuery = this.generateAllUrls(url, finalPage)
                    callback(null, urlsToQuery)
                } else { // one page
                    if (results.body !== "[]") { // at least one repo
                        let urlsToQuery = this.generateAllUrls(url, 1)
                        callback(null, urlsToQuery)
                    } else { // no repos
                        callback(null, [])
                    }
                }
            } else {
                return callback(error, null)
            }
        })
    }

    /**
     * Helper function to getAllPaginatedForURL.
     * Returns array of urls
     */
    generateAllUrls(baseUrl, pages) {
        let urlArray = [];
        for (let i = 1; i <= pages; i++) {
            urlArray.push(baseUrl + "&page=" + i)
        }
        return urlArray;
    }

    /**
     * Returns an array of usernames, to be used with getAllPaginatedForURL
     */
    getUserList(urlsToQuery, callback) {
        let self = this;
        let asyncTasks = [];
        urlsToQuery.forEach((url, index) => {
            asyncTasks.push(self.http.get.bind(self.http, url));
        })
        async.parallel(asyncTasks, function (error, results) {
            if (!error) {
                let c = results.map((value, index) => {
                    return JSON.parse(value.body).map((user, index) => {
                        return { username: user.login };
                    })
                })
                callback(null, _.flatten(c))
            } else {
                return callback(error, null)
            }
        })
    }

    /**
     * Returns an array of usernames of github users who are members of an organistation
     */
    getUsersForOrganisation(organisationId, callback) {
        let url = this.baseUrl + "orgs/" + organisationId + "/members" + this.authenticationQueryString;
        let asyncTasks = [];
        asyncTasks.push(this.getAllPaginatedForURL.bind(this, url))
        asyncTasks.push(this.getUserList.bind(this))
        async.waterfall(asyncTasks, (error, results) => {
            if (!error) {
                callback(null, results)
            } else {
                return callback(error, null)
            }
        });
    }

    /**
     * Returns array of repos for 1 username
     */
    getRepoNamesForUserId(user, callback) {
        let url = this.baseUrl + "users/" + user.username + "/repos" + this.authenticationQueryString;
        let asyncTasks = [];
        asyncTasks.push(this.getAllPaginatedForURL.bind(this, url))
        asyncTasks.push(this.getRepoList.bind(this))
        async.waterfall(asyncTasks, (error, results) => {
            if (!error) {
                callback(null, { username: user.username, repos: results })
            } else {
                return callback(error, null)
            }
        });
    }

    /**
     * Returns list of repos for a user, given a list a paginated urls to look through
     */
    getRepoList(urlsToQuery, callback) {
        let self = this;
        let asyncTasks = [];
        urlsToQuery.forEach((url, index) => {
            asyncTasks.push(this.http.get.bind(this.http, url));
        })
        async.parallel(asyncTasks, function (error, results) {
            if (!error) {
                let listOfRepos = results.map((value, index) => {
                    return JSON.parse(value.body).map((value, index) => {
                        return value.name;
                    })
                })
                callback(null, _.flatten(listOfRepos))
            } else {
                return callback(error, null)
            }
        })
    }
}

module.exports = GitHubService;