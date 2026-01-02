"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = signUp;
exports.login = login;
const auth_service_1 = require("../services/auth.service");
async function signUp(req, res) {
    const result = await (0, auth_service_1.signup)(req.body.username, req.body.password);
    return res.status(result.status).json(result.data);
}
async function login(req, res) {
    const result = await (0, auth_service_1.login)(req.body.username, req.body.password);
    return res.status(result.status).json(result.data);
}
exports.default = { signUp, login };
