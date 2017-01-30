class GitHubService {
    constructor(baseUrl, http, apiAuthenticationToken) {
        this.baseUrl = baseUrl;
        this.http = http;
        this.apiAuthenticationToken = apiAuthenticationToken;
        this.authenticationQueryString = "";
        if (this.apiAuthenticationToken !== "") {
            this.authenticationQueryString = "&access_token=" + this.apiAuthenticationToken;
        }
        this.perPage = "?per_page=100";
    }

    getUsersForOrganisation(organisationId) {
        let url = this.baseUrl + "orgs/" + organisationId + "/members" + this.perPage + this.authenticationQueryString;
        return new Promise((resolve, reject) => {
            this.getAllPaginatedForURL(url)
                .then((response) => {
                    let users = response[1];
                    let userList = users.map((user) => {
                        return { username: user.login }
                    });
                    resolve(userList);
                })
                .catch((error) => {
                    reject(error[1] + " with url: " + error[0]);
                })
        })
    }

    getAllPaginatedForURL(url) {
        return new Promise((resolve, reject) => {
            this.http.get(url)
                .then((response) => {
                    if (response.headers.link) { // if multiple pages
                        let myRe = new RegExp(/page=(\d+)>; rel="last"/, "g");
                        let finalPage = Number(myRe.exec(response.headers.link)[1]);
                        let urlsToQuery = this.generateAllUrls(url, finalPage);
                        let promisesList = urlsToQuery.map((url) => {
                            return this.http.get(url);
                        })
                        Promise.all(promisesList)
                            .then((responsesArray) => {
                                let collection = [];
                                responsesArray.forEach((response) => {
                                    JSON.parse(response.body).forEach((item) => {
                                        collection.push(item);
                                    })
                                })
                                resolve([url, collection]);
                            })
                            .catch((error) => {
                                reject([url, error]);
                            })
                    } else { // if one page, return immediately
                        resolve([url, JSON.parse(response.body)]);
                    }
                })
                .catch((error) => {
                    reject([url, error]);
                })
        });
    }

    generateAllUrls(baseUrl, pages) {
        let urlArray = [];
        for (let i = 1; i <= pages; i++) {
            urlArray.push(baseUrl + "&page=" + i)
        }
        return urlArray;
    }

    getReposForUser(user) {
        let url = this.baseUrl + "users/" + user + "/repos" + this.perPage + this.authenticationQueryString;
        return new Promise((resolve, reject) => {
            this.getAllPaginatedForURL(url)
                .then((response) => {
                    let url = response[0];
                    let repos = response[1];
                    let myRe = new RegExp(/users\/(.*)\//, "g");
                    let username = myRe.exec(url)[1];
                    let repoNameList = [];
                    repos.forEach((repo) => {
                        repoNameList.push(repo.name);
                    })
                    resolve({
                        username: username,
                        repos: repoNameList
                    })
                })
                .catch((error) => {
                    reject("Error: " + error[1] + "with url: " + error[0]);
                })
        })
    }
}

module.exports = GitHubService;