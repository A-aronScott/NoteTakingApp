import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import env from "../config/env.js";

const createToken = (userId) => {
    return jwt.sign(
        { userId: userId.toString() },
        env.jwtSecret,
        { expiresIn: "7d" }
    );
};

const sanitizeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};

export const registerUser = async ({ name, email, password }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        const error = new Error("An account with that email already exists.");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
    });

    const token = createToken(user._id);

    return {
        user: sanitizeUser(user),
        token
    };
};

export const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail
    });

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    const token = createToken(user._id);

    return {
        user: sanitizeUser(user),
        token
    };
};