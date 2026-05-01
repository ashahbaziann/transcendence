const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

function validate(schema, data)
{
    const valid = ajv.validate(schema, data);
    if(!valid)
    {
        return ajv.errors;
    }
    return null;
}
module.exports = {validate};