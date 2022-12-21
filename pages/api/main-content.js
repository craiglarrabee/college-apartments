// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DataStore } from "@aws-amplify/datastore";
import { HomePageContent } from "../../models";
import "@aws-crypto/sha256-js";

export default async function handler(req, res) {
    console.log(req);
    if (req.method === "POST") {
        await DataStore.save(
            new HomePageContent({
                location: req.body.location,
                managerOne: "Lorem ipsum dolor sit amet",
                managerTwo: "Lorem ipsum dolor sit amet",
                availability: "Lorem ipsum dolor sit amet",
                description: "Lorem ipsum dolor sit amet"
            })
        );
        res.status(204).send();
    }
}
