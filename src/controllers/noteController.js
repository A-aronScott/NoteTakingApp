import {
    getUserNotes,
    getNoteById,
    createUserNote,
    updateUserNote,
    deleteUserNote
} from "../services/noteService.js";

export const getNotes = async (req, res, next) => {
    try {
        const notes = await getUserNotes(req.user.id);

        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
};

export const getNote = async (req, res, next) => {
    try {
        const note = await getNoteById(
            req.params.id,
            req.user.id
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found."
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};

export const createNote = async (req, res, next) => {
    try {
        const {
            title,
            content,
            tags,
            isPinned,
            isArchived
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Note title is required."
            });
        }

        if (content !== undefined && typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Note content must be a string."
            });
        }

        if (tags !== undefined && !Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: "Note tags must be an array."
            });
        }

        if (isPinned !== undefined && typeof isPinned !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isPinned must be a boolean."
            });
        }

        if (
            isArchived !== undefined &&
            typeof isArchived !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "isArchived must be a boolean."
            });
        }

        const note = await createUserNote(req.user.id, {
            title,
            content,
            tags,
            isPinned,
            isArchived
        });

        res.status(201).json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};

export const updateNote = async (req, res, next) => {
    try {
        const { title, content, tags, isPinned, isArchived } = req.body;

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be a non-empty string."
                });
            }

            if (title.trim().length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Title must be 200 characters or less."
                });
            }
        }

        // Validate content if it was provided
        if (content !== undefined && typeof content !== "string") {
            return res.status(400).json({
                success: false,
                message: "Content must be a string."
            });
        }

        if (tags !== undefined) {
            if (
                !Array.isArray(tags) ||
                !tags.every((tag) => typeof tag === "string")
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Tags must be an array of strings."
                });
            }
        }

        if (isPinned !== undefined && typeof isPinned !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isPinned must be a boolean."
            });
        }

        // Validate isArchived if it was provided
        if (isArchived !== undefined && typeof isArchived !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isArchived must be a boolean."
            });
        }

        const note = await updateUserNote(
            req.params.id,
            req.user.id,
            req.body
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found."
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const deleted = await deleteUserNote(
            req.params.id,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Note not found."
            });
        }

        res.json({
            success: true,
            message: "Note deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};