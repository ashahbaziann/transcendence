
const oauthCallbackResponseSchema= 
{
    $id: "auth.oauthCallbackResponse",
    $ref: "auth.loginResponse#",
    additionalProperties: false
}
module.exports = oauthCallbackResponseSchema;