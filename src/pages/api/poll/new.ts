import type { NextApiRequest, NextApiResponse } from "next";
import * as Poll from "@/models/Poll";
import dbConnect from "@/lib/mongoose";

type Controller = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const handlePost: Controller = async (req, res) => {
    const poll = await Poll.createPoll(req.body);
    if (!poll) {
        res.status(404).json({ message: "Poll not found" });
    }
    res.json(poll);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await dbConnect();
        switch (req.method) {
            case "POST":
                return await handlePost(req, res);
            default:
                res.status(405).json({ message: "Method not allowed" });
        }
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ message: `Error: ${e.message}` });
    }
};

export default handler;
