// functions/users.js
exports.handler = async (event) => {
    try {
        // Handle POST request
        if (event.httpMethod === 'POST') {
            if (!event.body) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        status: 'error',
                        message: 'Request body is required'
                    }),
                };
            }

            const { user_id, name, username, email } = JSON.parse(event.body);

            if (!user_id || !name || !username || !email) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        status: 'error',
                        message: 'user_id, name, username, and email are required'
                    }),
                };
            }

            return {
                statusCode: 201,
                body: JSON.stringify({
                    status: 'User created successfully',
                    user: {
                        user_id,
                        name,
                        username,
                        email
                    }
                }),
            };
        }

        // Default: GET request
        const users = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];

        return {
            statusCode: 200,
            body: JSON.stringify(users),
        };

    } catch (error) {
        console.error('Error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: 'Internal server error'
            }),
        };
    }
};
