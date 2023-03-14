import type { Query, DocumentData } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp(functions.config().firebase);

export const getResults = functions.https.onRequest((req, res) => {
    return cors()(req, res, async () => {
        const { slug } = req.query;
        let query: Query<DocumentData> = admin
            .firestore()
            .collection("results");
        if (slug) {
            query = query.where("slug", "==", slug.toString());
        }
        const results = await query.get().then((snap) => snap.docs);
        if (results.length <= 0) {
            res.status(404).json({
                message: "Results with slug not found",
            });
            return;
        }
        const doc = results[0];
        res.json({
            id: doc.id,
            ...doc.data(),
        });
    });
});

export const answer = functions.https.onRequest((req, res) => {
    return cors()(req, res, async () => {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({
                message: "Must provide an `id` query",
            });
            return;
        }
        const { answer } = req.body;
        if (!answer) {
            res.status(400).json({
                message: "`answer` is required in the POST body",
            });
            return;
        }
        const db = admin.firestore().collection("results");
        const doc = await db.doc(id.toString()).get();
        if (!doc.exists || !doc.data()) {
            res.status(404).json({
                message: "Result does not exists",
            });
            return;
        }
        const answers = doc.data()?.answers;
        answers[answer.toString()] = answers[answer.toString()] + 1;
        const results = db.doc(doc.id).set({
            ...doc.data(),
            answers,
        });
        res.status(200).json(results);
    });
});

export const changeAnswer = functions.https.onRequest((req, res) => {
    return cors()(req, res, async () => {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({
                message: "Must provide an `id` query",
            });
            return;
        }
        const { from, to } = req.body;
        if (!from) {
            res.status(400).json({
                message: "`from` is required in the POST body",
            });
            return;
        }
        const db = admin.firestore().collection("results");
        const doc = await db.doc(id.toString()).get();
        if (!doc.exists || !doc.data()) {
            res.status(404).json({
                message: "Result does not exists",
            });
            return;
        }
        const answers = doc.data()?.answers;
        if (answers[from.toString()] > 0) {
            answers[from.toString()] = answers[from.toString()] - 1;
        }
        if (to) {
            answers[to.toString()] = answers[to.toString()] + 1;
        }
        const results = db.doc(doc.id).set({
            ...doc.data(),
            answers,
        });
        res.status(200).json(results);
    });
});

export const createPoll = functions.https.onRequest((req, res) => {
    return cors()(req, res, async () => {
        const results = await admin
            .firestore()
            .collection("results")
            .add({
                type: "poll",
                ...req.body,
            });
        res.status(200).json(results);
    });
});
