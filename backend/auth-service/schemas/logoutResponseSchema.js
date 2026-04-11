

const logoutResponseSchema = 
{
    $id: "auth.logoutResponse",
    type: "object",
    required: ["message"],
    properties: 
    {
        message: {type: "string"}
    },
    additionalProperties: false
}
module.exports = logoutResponseSchema;