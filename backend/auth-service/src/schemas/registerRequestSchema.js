
const registerRequestSchema = 
{
    $id: "auth.registerRequest",
    type: "object",
    required: ["email", "password"],
    properties: 
    {
        username: {type: "string", minLength: 5, maxLength: 15, pattern: "^[a-zA-Z0-9_-]+$"},
        email: {type: "string", format: 'email'},
        password: {type: "string", minLength: 10}
    },
    additionalProperties: false
}

module.exports = registerRequestSchema;