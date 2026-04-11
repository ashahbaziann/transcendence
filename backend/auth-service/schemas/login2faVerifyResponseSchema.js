const login2faVerifyResponseSchema = 
{
    $id: "auth.login2faVerifyResponse",
    type: "object",
    required: ["verified"],
    properties: 
    {
        verified: { const: true }
    },
    additionalProperties: false
}
module.exports = login2faVerifyResponseSchema;