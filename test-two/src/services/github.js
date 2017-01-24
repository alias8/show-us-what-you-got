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
        this.allReposUrl = [];
    }

    queryLength(url, callback) {
        this.http.get(url, (error, results) => {
            if (!error) {
                let myRe = new RegExp(/page=(\d+)>; rel="last"/, "g");
                let finalPage = Number(myRe.exec(results.headers.link)[1]);
                callback(null, finalPage)
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

    getUserListForOrganisation(urlArray, callback) {
        let asyncTasks = []; // https://api.github.com/users/3lvis/repos // https://api.github.com/organizations/69631/members?access_token=fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058&page=1
        urlArray.forEach((url, index) => {
            asyncTasks.push(this.http.get.bind(this.http, url));
        })
        async.parallel(asyncTasks, function (error, results) {
            if (!error) {
                let c = results.map((value, index) => {
                    return JSON.parse(value.body).map((value, index) => {
                        return value.login;
                    })
                })
                let d = _.flatten(c);
                callback(null, d)
            } else {
                return callback(error, null)
            }
        })
    }

    getUsersAndReposForOrganisation(organisationId, callback) {
        let url = "https://api.github.com/organizations/69631/members?access_token=fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058";
        this.queryLength(url, (error, results) => {
            if (!error) {
                let urlArray = this.generateAllUrls(url, results)
                this.getUserListForOrganisation(urlArray, (error, results) => {
                    if (!error) {
                        
                    } else {

                    }
                })
                let c = 2;
            } else {
                let b = 2;
            }
        })

        // let self = this;
        // let asyncTasks1 = []; // https://api.github.com/users/3lvis/repos // https://api.github.com/organizations/69631/members?access_token=fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058&page=1
        // asyncTasks1.push(this.http.get.bind(this.http, "https://api.github.com/users/3lvis/repos?access_token=fa41c1adf3b7ae0b2f219e7ac7d2e1665a257058"));
        // async.parallel(asyncTasks1, function (error, results) {
        //     if (!error) {
        //         let flat = _.flatten(results)
        //         self.allReposUrl = flat.map((user) => {
        //             return user.repos_url;
        //         })
        //         callback(null, null)
        //     } else {
        //         return callback(error, null)
        //     }
        // })
    }


}

module.exports = GitHubService;