import Http from "./http";
import request from "request";
import sinon from "sinon";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

let should = chai.should();

chai.use(chaiAsPromised);

describe("http", () => {
    let http;
    let requestGetStub;

    const testEndpoint = "https://google.com";

    const testBody = JSON.stringify([
        {
            Id: 1,
            Name: "Test One"
        },
        {
            Id: 2,
            Name: "Test Two"
        },
        {
            Id: 3,
            Name: "Test Three"
        }
    ]);

    beforeEach(() => {

    });

    afterEach(() => {
        requestGetStub.restore();
    });

    it("should return list of objects without error", (done) => {
        //Arrange
        requestGetStub = sinon.stub(request, 'get').yields(null, { statusCode: 200 }, testBody); // request.get method has been replaced with this stub function

        http = new Http(request); // http object now constructed with stub replacement

        //Act
        var getPromise = http.get(testEndpoint); // the promise from the get function returns the arguments in the "yields" above

        //Assert
        getPromise.should.eventually.deep.equal({ statusCode: 200 }).notify(done);
    });

    it("should fail when http error occurs", (done) => {
        //Arrange
        sinon.stub(request, 'get').yields({error: "404"}, { statusCode: 404 }, "Failed with 404");

        //Act
        var getPromise = http.get(testEndpoint);

        //Assert
        getPromise.should.be.rejected.notify(done);
    });
});