import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Health Check API", () => {
    it("should return a successful health check", async () => {
        const response = await request(app)
            .get("/api/health");

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.message).to.equal(
            "Notes API is running"
        );
    });
});