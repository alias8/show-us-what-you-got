import GitHubService from "./github";
import Http from "./../helpers/http";
import sinon from "sinon";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonAsPromised from "sinon-as-promised";
import path from "path";
import config from "../../config.json";
import usernames from "../../usernames.json";
import repos from "../../usernames-and-repos.json";

let should = chai.should();

chai.use(chaiAsPromised);

describe("github service", () => {
    const baseGitHubUrl = "https://api.github.com/";
    const gitHubApiAuthToken = config.gitHubApiAuthToken;
    let gitHubService;
    let http;
    let httpGetStub;

    const organisationId = "facebook";

    const userData = [
        {
            userId: "one"
        },
        {
            userId: "two"
        },
        {
            userId: "three"
        }
    ];

    beforeEach(() => {
        http = new Http();
        httpGetStub = sinon.stub(http, 'get'); // http.get method has been replaced with this stub function
    });

    afterEach(() => {
        httpGetStub.restore();
    });

    it("should return users for organisation1", (done) => {
        //Arrange
        httpGetStub.resolves(usernames);

        gitHubService = new GitHubService(baseGitHubUrl, http, gitHubApiAuthToken); // pass in stubbed function

        //Act
        let promise = gitHubService.getUsersForOrganisation(organisationId);

        //Assert
        promise.should.eventually.deep.equal(usernames).notify(done);
    });

    it("should append authentication parameter to url", () => {
        //Arrange
        const secret = config.gitHubApiAuthToken;

        httpGetStub.resolves(userData);

        gitHubService = new GitHubService(baseGitHubUrl, http, secret);

        //Act
        gitHubService.getUsersForOrganisation(organisationId);

        //Assert
        httpGetStub.getCall(0).args[0].endsWith("access_token=" + secret).should.equal(true); // inspects the parameter passed to http.get(url)
    });

    it("should prepend base url to url", () => {
        //Arrange
        const secret = "secret";

        httpGetStub.resolves(userData);

        gitHubService = new GitHubService(baseGitHubUrl, http, secret);

        //Act
        gitHubService.getUsersForOrganisation(organisationId);

        //Assert
        httpGetStub.getCall(0).args[0].startsWith(baseGitHubUrl).should.equal(true);
    });
});