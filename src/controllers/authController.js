import { registerUser, loginUser } from "../services/authService.js";
import {
    validateRegistration,
    validateLogin
} from "../utils/validators.js";

export const register = async (req, res, next) => {
    try {
        const errors = validateRegistration(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const result = await registerUser(req.body);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const errors = validateLogin(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        const result = await loginUser(req.body);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};