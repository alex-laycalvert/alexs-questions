import type { NextApiRequest, NextApiResponse } from "next";
import * as Poll from "@/models/Poll";
import dbConnect from "@/lib/mongoose";

type Controller = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const handleGet: Controller = async (_req, res) => {
    const poll = await Poll.getNewestPoll();
    if (!poll) {
        res.status(404).json({ message: "Poll not found" });
        return;
    }
    res.json(poll);
};

const handlePost: Controller = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        res.status(400).json({ message: "Must provide an `id` query" });
        return;
    }
    const { answer } = req.body;
    if (!answer) {
        res.status(400).json({
            message: "Must provide an `answer` in the POST body`",
        });
        return;
    }
    const poll = await Poll.addAnswer(id.toString(), answer);
    if (!poll) {
        res.status(404).json({ message: "Poll not found" });
        return;
    }
    res.status(200).json(poll);
};

const handlePut: Controller = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        res.status(400).json({ message: "Must provide an `id` query" });
        return;
    }
    const { from, to } = req.body;
    if (!from) {
        res.status(400).json({
            message: "Must provide a `from` and optionally a `to` in the PUT body`",
        });
        return;
    }
    const poll = await Poll.changeAnswer(id.toString(), from, to);
    if (!poll) {
        res.status(404).json({ message: "Poll not found" });
        return;
    }
    res.status(200).json(poll);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await dbConnect();
        switch (req.method) {
            case "GET":
                return await handleGet(req, res);
            case "POST":
                return await handlePost(req, res);
            case "PUT":
                return await handlePut(req, res);
            default:
                res.status(405).json({ message: "Method not allowed" });
        }
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: `Error: ${e.message}` });
    }
};

export default handler;
