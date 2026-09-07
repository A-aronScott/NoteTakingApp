import express from "express";

import {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/noteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;