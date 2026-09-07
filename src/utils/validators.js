export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRegistration = ({ name, email, password }) => {
    const errors = {};

    if (!name?.trim()) {
        errors.name = "Name is required";
    }

    if (!email || !validateEmail(email)) {
        errors.email = "Valid email is required";
    }

    if (!password || password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    return errors;
};

export const validateLogin = ({ email, password }) => {
    const errors = {};

    if (!email || !validateEmail(email)) {
        errors.email = "Valid email is required";
    }

    if (!password) {
        errors.password = "Password is required";
    }

    return errors;
};