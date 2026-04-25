
const registerResponseSchema =
{
    $id: "auth.registerResponse",
    type: "object",
    required: ["message"],
    properties:
    {
        message: {type: "string"}
    },
    additionalProperties: false
}
module.exports = registerResponseSchema;