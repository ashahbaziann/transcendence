

const loginRequestSchema = 
{
    $id: "auth.loginRequest",
    type: "object",
    required: ["loginTicket", "otp"],
    properties: 
    {
        loginTicket: {type: "string", format: 'uuid'},
        otp: {type: "string", pattern: "^[0-9]{6}$"}
    },
    additionalProperties: false
}

module.exports = loginRequestSchema;