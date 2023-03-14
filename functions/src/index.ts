import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

export const getResults = functions.https.onRequest(async (req, res) => {
    const slug = req.query.slug;
    if (!slug) {
        const results = await admin.firestore().collection("results").get();
        res.json(results.docs.map((d) => d.data()));
        return;
    }
    const results = await admin
        .firestore()
        .collection("results")
        .where(slug.toString())
        .get();

    res.json(results.docs.map((d) => d.data()));
});
