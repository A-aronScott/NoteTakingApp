import "dotenv/config";

const env = {
    port: process.env.PORT || 3000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET
};

if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not defined");
}

if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
}

export default env;