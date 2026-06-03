const BASE_API_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
const DIRECT_API_BASE_URL = (process.env.NEXT_PUBLIC_DIRECT_API_BASE_URL || "").replace(/\/$/, "");

const getResolvedDirectApiBase = () => {
    if (DIRECT_API_BASE_URL) {
        return DIRECT_API_BASE_URL;
    }

    if (typeof window === "undefined") {
        return "";
    }

    // Default to direct backend in local development to avoid proxy socket resets on multipart uploads.
    if (process.env.NODE_ENV === "production") {
        return "";
    }

    if (BASE_API_URL !== "/api") {
        return "";
    }

    const { hostname, protocol } = window.location;
    if (!hostname) {
        return "";
    }

    const directProtocol = protocol === "https:" ? "https:" : "http:";
    return `${directProtocol}//${hostname}:4000/api`;
};

const buildRequestUrl = (baseUrl, path) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return {
        normalizedPath,
        url: `${baseUrl}${normalizedPath}`,
    };
};

const maybeRetryWithDirectApi = async ({
    path,
    options,
    primaryResponse,
    preferDirect,
}) => {
    const resolvedDirectBase = getResolvedDirectApiBase();

    if (!resolvedDirectBase) {
        return primaryResponse;
    }

    const primaryBase = preferDirect ? resolvedDirectBase : BASE_API_URL;
    if (primaryBase === resolvedDirectBase) {
        return primaryResponse;
    }

    // Retry transient upstream/proxy failures against direct backend origin.
    if (!primaryResponse || [502, 503, 504].includes(primaryResponse.status)) {
        const { url: directUrl } = buildRequestUrl(resolvedDirectBase, path);
        return fetch(directUrl, options);
    }

    return primaryResponse;
};

const parseResponseBody = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    try {
        const text = await response.text();
        return {
            message: text || null,
        };
    } catch {
        return null;
    }
};

const formatHttpError = (response, payload) => {
    const bodyMessage = payload?.message;
    if (bodyMessage && typeof bodyMessage === "string") {
        return bodyMessage;
    }

    if (response.status === 500) {
        return "Backend failed to process this request. Check backend server logs for details.";
    }

    if (response.status === 502 || response.status === 503 || response.status === 504) {
        return "Backend is temporarily unreachable. Please try again.";
    }

    return `HTTP error! status: ${response.status}`;
};

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const directToken = localStorage.getItem('token');
    if (directToken) {
        return directToken;
    }

    const persistedUser = localStorage.getItem('user');
    if (!persistedUser) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(persistedUser);
        return parsedUser?.token || null;
    } catch {
        return null;
    }
};

export const request = async (path, data = null, method = "GET") => {
    try {
        const { url } = buildRequestUrl(BASE_API_URL, path);
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        // Add token if exists
        const token = getAuthToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (method === "POST" || method === "PUT" || method === "PATCH") {
            options.body = JSON.stringify(data);
        }

        let response;
        try {
            response = await fetch(url, options);
        } catch (networkError) {
            response = await maybeRetryWithDirectApi({
                path,
                options,
                primaryResponse: null,
                preferDirect: false,
            });

            if (!response) {
                throw networkError;
            }
        }

        response = await maybeRetryWithDirectApi({
            path,
            options,
            primaryResponse: response,
            preferDirect: false,
        });

        const result = await parseResponseBody(response);

        if (!response.ok) {
            return {
                error: true,
                message: formatHttpError(response, result),
                data: null
            };
        }

        return { 
            error: false, 
            data: result?.data ?? null,
            message: result?.message,
            meta: result?.meta ?? null,
        };
    } catch (error) {
        console.error('Request Error:', error);
        return { 
            error: true,
            message: error.message || "An error occurred",
            data: null
        };
    }
};

export const requestForm = async (path, formData, method = "POST") => {
    try {
        const primaryBase = getResolvedDirectApiBase() || BASE_API_URL;
        const { url } = buildRequestUrl(primaryBase, path);
        const options = {
            method,
            headers: {},
            body: formData,
        };

        const token = getAuthToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        let response;
        try {
            response = await fetch(url, options);
        } catch (networkError) {
            response = await maybeRetryWithDirectApi({
                path,
                options,
                primaryResponse: null,
                preferDirect: true,
            });

            if (!response) {
                throw networkError;
            }
        }

        response = await maybeRetryWithDirectApi({
            path,
            options,
            primaryResponse: response,
            preferDirect: true,
        });

        const result = await parseResponseBody(response);

        if (!response.ok) {
            return {
                error: true,
                message: formatHttpError(response, result),
                data: null,
            };
        }

        return {
            error: false,
            data: result?.data ?? null,
            message: result?.message,
            meta: result?.meta ?? null,
        };
    } catch (error) {
        console.error('Form Request Error:', error);
        return {
            error: true,
            message: error.message || 'An error occurred',
            data: null,
        };
    }
};