
const oauthCallbackRequestSchema = 
{
    $id: "auth.oauthCallbackRequest",
    type: "object",
    required: ["code"],
    properties: 
    {
        code: {type: "string"}
    },
    additionalProperties: false
}
module.exports = oauthCallbackRequestSchema;