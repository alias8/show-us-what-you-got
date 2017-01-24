import request from "request";

class Http {
    constructor(overrideRequest) {
        this.request = overrideRequest || request;
    }

    get(url, callback) {
        let self = this;
        let requestOptions = {
            url,
            headers: {
                "User-Agent": "request"
            }
        };

        this.request.get(requestOptions, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                callback(null, response);
            } else {
                callback(JSON.stringify(response), null);
            }
        });
    }
}

module.exports = Http;