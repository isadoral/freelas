export const generateToken = () => {
    return require("crypto").randomBytes(16).toString("base64")

};

