import mongoose from "mongoose";

export interface Poll extends mongoose.Document {
    _id: string;
    name: string;
    description: string;
    closesAt: Date;
    answers: { key: string; count: number }[];
}

interface PollCreateInput {
    name: string;
    description: string;
    closesAt: Date;
    answers: { key: string; count: number }[];
}

const PollSchema = new mongoose.Schema({
    name: String,
    description: String,
    closesAt: Date,
    answers: [{ key: String, count: Number }],
});

const Poll = mongoose.models.Poll ?? mongoose.model<Poll>("Poll", PollSchema);

export default Poll;

export const getNewestPoll = async (): Promise<Poll | null> => {
    return await Poll.findOne().sort({ _id: -1 });
};

export const getPollById = async (id: string): Promise<Poll | null> => {
    return await Poll.findById(id);
};

export const addAnswer = async (
    id: string,
    answer: string
): Promise<Poll | null> => {
    const poll = await getPollById(id);
    if (!poll) {
        return null;
    }
    poll.answers = poll.answers.map((a) => {
        if (a.key === answer) {
            return {
                key: answer,
                count: a.count + 1,
            };
        }
        return a;
    });
    await poll.save();
    return poll;
};

export const changeAnswer = async (
    id: string,
    from: string,
    to?: string
): Promise<Poll | null> => {
    const poll = await getPollById(id);
    if (!poll) {
        return null;
    }
    poll.answers = poll.answers.map((a) => {
        if (a.key === from && a.count > 0) {
            return {
                key: from,
                count: a.count - 1,
            };
        }
        if (a.key === to) {
            return {
                key: to,
                count: a.count + 1,
            };
        }
        return a;
    });
    await poll.save();
    return poll;
};

export const createPoll = async (input: PollCreateInput): Promise<Poll> => {
    return await Poll.create(input);
};
