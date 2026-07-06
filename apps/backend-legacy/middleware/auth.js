function authMiddleware(request, response, next) {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        return response.status(401).json({message: 'Authorization header is required'});
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return response.status(401).json({message: 'Authorization header must be Bearer <token>'});
    }

    request.token = parts[1];
    next();
}

module.exports = authMiddleware;
