export const STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
};

export const SUCCESS_MESSAGE = {
  CREATE_USER: "User created successfully",
};

export const ERROR_MESSAGE = {
  USER_EXISTS: "Username already exists",
  SERVER_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized access",
};

export const TOKEN_CONSTANTS = {
  SECRET_KEY: process.env.JWT_SECRET,
  EXPIRATION_TIME: "1h",
};
