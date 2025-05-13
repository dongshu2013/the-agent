async function postApiService(endpoint: string, token: string, body: any) {
    if (!process.env.API_URL) {
        throw new Error("API_URL is not defined");
    }

    const response = await fetch(`${process.env.API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    return response.json();
}

export async function postCheckout(token: string, amount: number): Promise<any> {
    return await postApiService("/v1/stripe/checkout", token, { amount });
}

async function getApiService(endpoint: string, token: string): Promise<any> {
    if (!process.env.API_URL) {
        throw new Error("API_URL is not defined");
    }
``
    const response = await fetch(`${process.env.API_URL}/${endpoint}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    return response.json();
}

export interface GetUserResponse {
    success: boolean;
    user: {
        api_key: string;
        api_key_enabled: boolean;
        balance: number;
        email: string;
    };
}

export async function getUserInfo(token: string): Promise<GetUserResponse> {
    return await getApiService("/v1/user", token);
}

export async function getCreditHistory(token: string): Promise<any> {
    return await getApiService("/v1/user/credit_history", token);
}
