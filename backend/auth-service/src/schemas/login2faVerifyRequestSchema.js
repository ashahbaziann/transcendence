
const login2faVerifyRequestSchema = 
{
    $id: "auth.login2faVerifyRequest",
    type: "object",
    required: ["otp", "userId"],
    properties: 
    {
        otp: {type: "string", pattern: '^[0-9]{6}$'},
    },
    additionalProperties: false
}
module.exports = login2faVerifyRequestSchema;