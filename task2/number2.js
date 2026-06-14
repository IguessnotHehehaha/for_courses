const fs = require("fs");
const crypto = require("crypto");

const email = "tnurikhanov@gmail.com";
const dir = "./for_task2";

const hashes = fs.readdirSync(dir)
    .map(file => {
        const hash = crypto.createHash("sha3-256").update(fs.readFileSync(`${dir}/${file}`)).digest("hex");

        return {
            hash,
            key: [...hash].reduce((p, c) => p * BigInt(parseInt(c, 16) + 1), 1n)
        };
    }).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0).map(x => x.hash).join("");

console.log(crypto.createHash("sha3-256").update(hashes + email.toLowerCase()).digest("hex"));