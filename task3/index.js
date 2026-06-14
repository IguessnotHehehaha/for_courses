const express = require("express");

const app = express();

const emailPath = "tnurikhanov_gmail_com"; // e.g. john_smith_example_com

function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return a;
}

app.get(`/${emailPath}`,(req,res)=>{
    let{x,y}=req.query

    if(typeof x!="string"|| typeof y!="string"|| !/^[1-9]\d*$/.test(x)|| !/^[1-9]\d*$/.test(y))
        return res.send("NaN")

    x=BigInt(x)
    y=BigInt(y)

    res.send(String(x/gcd(x,y)*y))
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});