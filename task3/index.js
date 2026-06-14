const express = require("express");

const app = express();

const emailPath = "tnurikhanov_gmail_com"; // e.g. john_smith_example_com

function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
}

app.get(`/${emailPath}`, (req, res) => {
    const x = Number(req.query.x);
    const y = Number(req.query.y);

    if (
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        x < 1 ||
        y < 1
    ) {
        return res.send("NaN");
    }

    const lcm = x / gcd(x, y) * y;

    res.send(String(lcm));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});