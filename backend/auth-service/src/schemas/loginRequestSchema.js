

const loginRequestSchema = {
  $id: "auth.loginRequest",
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 }
  },
  additionalProperties: false
}

module.exports = loginRequestSchema;