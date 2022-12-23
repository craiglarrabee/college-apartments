// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");
const { Sha256 } = require("@aws-crypto/sha256-js");
const {
    AWS_REGION
} = process.env;
const creds = fromNodeProviderChain();
const signer = new SignatureV4({
    service: "execute-api",
    region: AWS_REGION,
    credentials: creds,
    sha256: Sha256,
});

export default async function handler(req, res) {
    console.log(req);
    console.log(signer.toString());
    if (req.method === "POST") {
        // await DataStore.save(
        //     new HomePageContent({
        //         location: req.body.location,
        //         managerOne: "Lorem ipsum dolor sit amet",
        //         managerTwo: "Lorem ipsum dolor sit amet",
        //         availability: "Lorem ipsum dolor sit amet",
        //         description: "Lorem ipsum dolor sit amet"
        //     })
        // );
        res.status(204).send();
    }
}
