const BASE_API_URL = "http://localhost:4000"; // Use environment variables in production

export const request = async (path, data = null, method = "GET") => {
    try {
        const url = `${BASE_API_URL}${path}`;
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        // Add token if exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (method === "POST" || method === "PUT" || method === "PATCH") {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            return {
                error: true,
                message: result.message || `HTTP error! status: ${response.status}`,
                data: null
            };
        }

        return { 
            error: false, 
            data: result.data,
            message: result.message 
        };
    } catch (error) {
        console.error('Request Error:', error);
        return { 
            error: true,
            message: error.message || "An error occurred",
            data: null
        };
    }
}