import Note from "../models/Note.js";

export const getUserNotes = async (userId) => {
    return await Note.find({
        user: userId
    }).sort({
        isPinned: -1,
        updatedAt: -1
    });
};

export const getNoteById = async (noteId, userId) => {
    if (!/^[0-9a-fA-F]{24}$/.test(noteId)) {
        return null;
    }

    return await Note.findOne({
        _id: noteId,
        user: userId
    });
};

export const createUserNote = async (userId, noteData) => {
    return await Note.create({
        ...noteData,
        user: userId
    });
};

export const updateUserNote = async (
    noteId,
    userId,
    updateData
) => {
    if (!/^[0-9a-fA-F]{24}$/.test(noteId)) {
        return null;
    }

    const allowedFields = [
        "title",
        "content",
        "tags",
        "isPinned",
        "isArchived"
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    const note = await Note.findOne({
        _id: noteId,
        user: userId
    });

    if (!note) {
        return null;
    }

    Object.assign(note, updates);

    await note.save();

    return note;
};

export const deleteUserNote = async (noteId, userId) => {
    if (!/^[0-9a-fA-F]{24}$/.test(noteId)) {
        return null;
    }

    return await Note.findOneAndDelete({
        _id: noteId,
        user: userId
    });
};