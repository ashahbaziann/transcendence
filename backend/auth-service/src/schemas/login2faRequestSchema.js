const login2faRequestSchema = 
{
    $id: "auth.login2faRequest",
    type:  "object",
    required: ["code", "userId"],
    properties: {
        code: {type: "string", minLength: 6, maxLength: 6},
        userId: {type: "integer", minimum: 1}
    },
    additionalProperties: false
}
module.exports = login2faRequestSchema;