class BossHog {
    constructor() {
    }

    printMessage(number) {
        let message;
        if (number % 15 === 0) {
            message = "BossHog";
        } else if (number % 5 === 0) {
            message = "Hog";
        } else if (number % 3 === 0) {
            message = "Boss";
        } else {
            message = number;
        }
        return message;
    }
}

module.exports = BossHog;