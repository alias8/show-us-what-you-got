import request from "request";

class Http {
    constructor(overrideRequest) {
        this.request = overrideRequest || request;
        this.requestNumber = 0;
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
            this.requestNumber++;
            console.log('request number ' + this.requestNumber);
            if (!error && response.statusCode == 200) {
                callback(null, response);
            } else {
                let parsedBody = JSON.parse(body)
                callback(parsedBody.message, null);
            }
        });
    }
}

module.exports = Http;