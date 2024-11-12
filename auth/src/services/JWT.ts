import jwt from "jsonwebtoken";

export const generateUserJwt = (id: string, email: string, userType: string) => {
    // Generate JWT
    return jwt.sign({
            id: id,
            email: email,
            userType: userType,
        },
        process.env.JWT_KEY!,
        { expiresIn: "1h" }
    );
};