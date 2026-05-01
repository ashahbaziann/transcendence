
const loginResponseSchema = 
{
    $id: "auth.loginResponse",
    type: "object",
    required: ["accessToken", "userId"],
    properties:
    {
        accessToken: {type: "string"},
        userId: {type: "integer", minimum:1}
    },
    additionalProperties: false
}

module.exports = loginResponseSchema;