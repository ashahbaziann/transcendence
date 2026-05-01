
const errorResponseSchema = 
{
    $id: "auth.errorResponse",
    type: "object",
    required: ["status_code", "error_message"],
    properties: 
    {
        status_code: {type: "string"},
        error_message: { type: "string"}
    },
    additionalProperties: false
}
module.exports = errorResponseSchema;