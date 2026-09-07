import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";
import connectDatabase from "../src/config/database.js";

describe("Authentication API", () => {

    before(async () => {
        await connectDatabase();
    });

    it("should register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: `test-${Date.now()}@example.com`,
                password: "password123"
            });

        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);
        expect(response.body.data.user).to.exist;
        expect(response.body.data.user.name).to.equal("Test User");
        expect(response.body.data.user.email).to.include("@example.com");
        expect(response.body.data.token).to.be.a("string");
    });

    it("should login an existing user", async () => {
        const email = `login-${Date.now()}@example.com`;
        const password = "password123";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login Test User",
                email,
                password
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data.user).to.exist;
        expect(response.body.data.user.name).to.equal(
            "Login Test User"
        );
        expect(response.body.data.user.email).to.equal(email);
        expect(response.body.data.token).to.be.a("string");
    });

    it("should reject an incorrect password", async () => {
        const email = `wrong-password-${Date.now()}@example.com`;
        const password = "password123";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Password Test User",
                email,
                password
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "wrongpassword"
            });

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Invalid email or password."
        );
    });

    it("should reject a login for a non-existent user", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: `does-not-exist-${Date.now()}@example.com`,
                password: "password123"
            });

        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
        expect(response.body.message).to.equal(
            "Invalid email or password."
        );
    });

it("should reject registration with an invalid email", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Invalid Email User",
            email: "not-an-email",
            password: "password123"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.errors.email).to.equal(
        "Valid email is required"
    );
});

it("should reject registration with a password that is too short", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Short Password User",
            email: `short-password-${Date.now()}@example.com`,
            password: "123"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.errors.password).to.equal(
        "Password must be at least 6 characters"
    );
});

it("should reject registration with an email that already exists", async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const password = "password123";

    // Create the first user
    const firstResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "First User",
            email,
            password
        });

    expect(firstResponse.status).to.equal(201);

    // Try to create another user with the same email
    const secondResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Second User",
            email,
            password
        });

    expect(secondResponse.status).to.equal(409);
    expect(secondResponse.body.success).to.equal(false);
    expect(secondResponse.body.message).to.equal(
        "An account with that email already exists."
    );
});

it("should reject registration without a name", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "",
            email: `no-name-${Date.now()}@example.com`,
            password: "password123"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.errors.name).to.equal(
        "Name is required"
    );
});

it("should reject login with an invalid email", async () => {
    const response = await request(app)
        .post("/api/auth/login")
        .send({
            email: "not-an-email",
            password: "password123"
        });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
    expect(response.body.errors.email).to.equal(
        "Valid email is required"
    );
});

});