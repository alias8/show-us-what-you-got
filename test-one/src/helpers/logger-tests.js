import Logger from "./logger";
import BossHog from "../bosshog";
import sinon from "sinon";
import { expect } from "chai";

describe("BossHog loop test", () => {
    function printBossHogMessage(number) {
        describe("number " + number, () => {
            let bossHog;
            let logger;
            let consoleLogSpy;
            let correctMessage = getCorrectMessage(number);
            beforeEach(() => {
                bossHog = new BossHog();
                logger = new Logger();
                consoleLogSpy = new sinon.spy(bossHog, "printMessage");
            });
            it("should log:" + correctMessage, () => {
                const message = bossHog.printMessage(number);
                expect(bossHog.printMessage.calledWith(number)).to.be.equal(true);
                expect(message).to.equal(correctMessage);
            });

        });
    }

    for (let number = 1; number <= 100; number++) {
        printBossHogMessage(number);
    }

    function getCorrectMessage(number) {
        if (number % 15 === 0) {
            return "BossHog";
        } else if (number % 5 === 0) {
            return "Hog";
        } else if (number % 3 === 0) {
            return "Boss";
        } else {
            return number;
        }
    }
});

