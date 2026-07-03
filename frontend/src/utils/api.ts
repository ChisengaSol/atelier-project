export const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        // tell the browser to send the HttpOnly cookie
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
};