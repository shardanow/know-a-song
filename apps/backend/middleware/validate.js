function validate(schema) {
    return (request, response, next) => {
        const result = schema.safeParse(request.body);
        if (!result.success) {
            const messages = result.error.issues.map(e => e.message).join(', ');
            return response.status(400).json({message: messages});
        }
        request.body = result.data;
        next();
    };
}

module.exports = validate;
