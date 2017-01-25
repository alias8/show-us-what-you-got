const async = require('async')
const _ = require('lodash')

class GitHubService {
    constructor(baseUrl, http, apiAuthenticationToken) {
        this.baseUrl = baseUrl;
        this.http = http;
        this.apiAuthenticationToken = apiAuthenticationToken;
        this.authenticationQueryString = "";
        if (this.apiAuthenticationToken !== "") {
            this.authenticationQueryString = "?access_token=" + this.apiAuthenticationToken;
        }
        this.urlsToQuery = [];
    }

    getAllUrls(url, callback) {
        let self = this;
        this.http.get(url, (error, results) => {
            if (!error) {
                if (results.headers.link) { // multiple pages
                    let myRe = new RegExp(/page=(\d+)>; rel="last"/, "g");
                    let a = url;
                    let finalPage = Number(myRe.exec(results.headers.link)[1]);
                    self.urlsToQuery = this.generateAllUrls(url, finalPage)
                    callback(null, null)
                } else { // one page
                    if (results.body !== "[]") { // at least one repo
                        self.urlsToQuery = this.generateAllUrls(url, 1)
                    } else { // no repos
                        self.urlsToQuery = []; // nothing to query, move to next
                    }
                    callback(null, null)
                }
            } else {
                return callback(error, null)
            }
        })
    }

    generateAllUrls(baseUrl, pages) {
        let urlArray = [];
        for (let i = 1; i <= pages; i++) {
            urlArray.push(baseUrl + "&page=" + i)
        }
        return urlArray;
    }

    getUserList(callback) {
        let self = this;
        let asyncTasks = [];
        this.urlsToQuery.forEach((url, index) => {
            asyncTasks.push(this.http.get.bind(this.http, url));
        })
        async.parallel(asyncTasks, function (error, results) {
            if (!error) {
                let c = results.map((value, index) => {
                    return JSON.parse(value.body).map((value, index) => {
                        return { username: value.login, id: value.id };
                    })
                })
                callback(null, _.flatten(c))
            } else {
                return callback(error, null)
            }
        })
    }

    getUsersForOrganisation(organisationId, callback) {
        let self = this;
        let url = this.baseUrl + "orgs/" + organisationId + "/members" + this.authenticationQueryString;
        let asyncTasks = [];
        asyncTasks.push(this.getAllUrls.bind(this, url))
        asyncTasks.push(this.getUserList.bind(this))
        async.series(asyncTasks, (error, results) => {
            if (!error) {
                callback(null, results[1])
            } else {
                return callback(error, null)
            }
        });
    }

    getRepoNamesForUserId(user, callback) {
        let self = this;
        let url = this.baseUrl + "users/" + user.username + "/repos" + this.authenticationQueryString;
        let asyncTasks = [];
        asyncTasks.push(this.getAllUrls.bind(this, url))
        asyncTasks.push(this.getRepoList.bind(this))
        async.series(asyncTasks, (error, results) => {
            if (!error) {
                callback(null, results[1])
            } else {
                return callback(error, null)
            }
        });




    }



    getRepoList(callback) {
        let self = this;
        let asyncTasks = [];
        self.urlsToQuery.forEach((url, index) => {
            asyncTasks.push(this.http.get.bind(this.http, url));
        })
        async.parallel(asyncTasks, function (error, results) {
            if (!error) {
                let c = results.map((value, index) => {
                    return JSON.parse(value.body).map((value, index) => {
                        return value.name;
                    })
                })
                callback(null, _.flatten(c))
            } else {
                return callback(error, null)
            }
        })
    }




}

module.exports = GitHubService;