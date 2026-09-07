import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import connectDatabase from "../src/config/database.js";

describe("Notes API", () => {

    before(async () => {
        await connectDatabase();
    });

    it("should reject unauthenticated access to notes", async () => {
        const response = await request(app)
            .get("/api/notes");

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Authentication required."
        );
    });

    it("should create a note for an authenticated user", async () => {
        const email = `note-user-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Note Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "My First Test Note",
                content: "This note was created by an automated test.",
                tags: ["testing", "notes"]
            });

        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);

        expect(response.body.data).to.exist;

        expect(response.body.data.title).to.equal(
            "My First Test Note"
        );

        expect(response.body.data.content).to.equal(
            "This note was created by an automated test."
        );

        expect(response.body.data.user).to.equal(
            registerResponse.body.data.user.id
        );
    });

    it("should get all notes for an authenticated user", async () => {
        const email = `get-notes-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Get Notes Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "First Test Note",
                content: "First note content"
            });

        await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Second Test Note",
                content: "Second note content"
            });

        const response = await request(app)
            .get("/api/notes")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);

        expect(response.body.data).to.be.an("array");
        expect(response.body.data.length).to.equal(2);

        expect(response.body.data[0].title).to.equal(
            "Second Test Note"
        );

        expect(response.body.data[1].title).to.equal(
            "First Test Note"
        );
    });

    it("should get a single note by ID", async () => {
        const email = `single-note-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Single Note Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const createResponse = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Single Note Test",
                content: "This is a single note."
            });

        expect(createResponse.status).to.equal(201);

        const noteId = createResponse.body.data._id;

        const response = await request(app)
            .get(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);

        expect(response.body.data).to.exist;
        expect(response.body.data._id).to.equal(noteId);
        expect(response.body.data.title).to.equal(
            "Single Note Test"
        );
        expect(response.body.data.content).to.equal(
            "This is a single note."
        );
    });

    it("should update an existing note", async () => {
        const email = `update-note-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Update Note Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const createResponse = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Original Title",
                content: "Original content"
            });

        expect(createResponse.status).to.equal(201);

        const noteId = createResponse.body.data._id;

        const response = await request(app)
            .put(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Updated Title",
                content: "Updated content",
                tags: ["updated", "testing"]
            });

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);

        expect(response.body.data).to.exist;
        expect(response.body.data._id).to.equal(noteId);

        expect(response.body.data.title).to.equal(
            "Updated Title"
        );

        expect(response.body.data.content).to.equal(
            "Updated content"
        );

        expect(response.body.data.tags).to.deep.equal([
            "updated",
            "testing"
        ]);
    });

    it("should delete an existing note", async () => {
        const email = `delete-note-${Date.now()}@example.com`;
        const password = "password123";

        // Create a test user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Delete Note Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const createResponse = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Note To Delete",
                content: "This note should be deleted."
            });

        expect(createResponse.status).to.equal(201);

        const noteId = createResponse.body.data._id;

        const response = await request(app)
            .delete(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.message).to.equal(
            "Note deleted successfully."
        );

        const getResponse = await request(app)
            .get(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body.success).to.equal(false);
        expect(getResponse.body.message).to.equal(
            "Note not found."
        );
    });

    it("should prevent one user from accessing another user's note", async () => {
        const userAEmail = `user-a-${Date.now()}@example.com`;
        const userBEmail = `user-b-${Date.now()}@example.com`;
        const password = "password123";

        // Create User A
        const userAResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "User A",
                email: userAEmail,
                password
            });

        expect(userAResponse.status).to.equal(201);

        const tokenA = userAResponse.body.data.token;

        // Create User B
        const userBResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "User B",
                email: userBEmail,
                password
            });

        expect(userBResponse.status).to.equal(201);

        const tokenB = userBResponse.body.data.token;

        const createResponse = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({
                title: "User A Private Note",
                content: "This note belongs to User A."
            });

        expect(createResponse.status).to.equal(201);

        const noteId = createResponse.body.data._id;

        const getResponse = await request(app)
            .get(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(getResponse.status).to.equal(404);
        expect(getResponse.body.success).to.equal(false);
        expect(getResponse.body.message).to.equal(
            "Note not found."
        );

        const updateResponse = await request(app)
            .put(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({
                title: "Hacked Title"
            });

        expect(updateResponse.status).to.equal(404);
        expect(updateResponse.body.success).to.equal(false);
        expect(updateResponse.body.message).to.equal(
            "Note not found."
        );

        const deleteResponse = await request(app)
            .delete(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(deleteResponse.status).to.equal(404);
        expect(deleteResponse.body.success).to.equal(false);
        expect(deleteResponse.body.message).to.equal(
            "Note not found."
        );

        const ownerCheckResponse = await request(app)
            .get(`/api/notes/${noteId}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(ownerCheckResponse.status).to.equal(200);
        expect(ownerCheckResponse.body.data.title).to.equal(
            "User A Private Note"
        );
    });

    it("should reject creating a note without a title", async () => {
        const email = `invalid-note-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid Note Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .post("/api/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "This note has no title."
            });

        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Note title is required."
        );
    });

    it("should reject an invalid JWT", async () => {
        const response = await request(app)
            .get("/api/notes")
            .set("Authorization", "Bearer this-is-not-a-valid-token");

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Invalid or expired authentication token."
        );
    });

    it("should reject a malformed Authorization header", async () => {
        const response = await request(app)
            .get("/api/notes")
            .set("Authorization", "NotBearer sometoken");

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Authentication required."
        );
    });

    it("should reject an invalid note ID", async () => {
        const email = `invalid-id-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid ID Test User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .get("/api/notes/not-a-real-id")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Note not found."
        );
    });

    it("should reject updating a note with an invalid ID", async () => {
        const email = `invalid-update-id-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid Update ID User",
                email,
                password
            });

        expect(registerResponse.status).to.equal(201);

        const token = registerResponse.body.data.token;

        const response = await request(app)
            .put("/api/notes/not-a-real-id")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Updated Title"
            });

        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Note not found."
        );
    });

it("should reject deleting a note with an invalid ID", async () => {
    const email = `invalid-delete-id-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Delete ID User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .delete("/api/notes/not-a-real-id")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "Note not found."
    );

});

it("should reject note content that is not a string", async () => {
    const email = `invalid-content-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Content User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Note",
            content: 12345
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "Note content must be a string."
    );
});

it("should reject note tags that are not an array", async () => {
    const email = `invalid-tags-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Tags User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Note",
            content: "Some content",
            tags: "not-an-array"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "Note tags must be an array."
    );
});

it("should reject isPinned when it is not a boolean", async () => {
    const email = `invalid-pinned-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Pinned User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Note",
            content: "Some content",
            isPinned: "yes"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "isPinned must be a boolean."
    );
});

it("should reject isArchived when it is not a boolean", async () => {
    const email = `invalid-archived-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Archived User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Note",
            content: "Some content",
            isArchived: "yes"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "isArchived must be a boolean."
    );
});

it("should reject isArchived when it is not a boolean", async () => {
    const email = `invalid-archived-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Archived User",
            email,
            password
        });

    expect(registerResponse.status).to.equal(201);

    const token = registerResponse.body.data.token;

    const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Test Note",
            content: "Some content",
            isArchived: "yes"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal(
        "isArchived must be a boolean."
    );
});

});