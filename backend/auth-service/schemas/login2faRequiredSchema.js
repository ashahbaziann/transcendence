
const login2faRequiredSchema = 
{
    $id: "auth.login2faRequired",
    type:  "object",
    required: ["requires2fa",  "loginTicket"],
    properties: {
        requires2fa: {type: "boolean"},
        loginTicket: { type: "string", format: "uuid"}
    },
    additionalProperties: false
}
module.exports = login2faRequiredSchema;