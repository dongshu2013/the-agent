import { authenticateRequest, createCustomToken } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { isAuthenticated, uid, email } = await authenticateRequest(
        body.token
    );
    if (!isAuthenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = await createCustomToken(uid, email);
    return NextResponse.json({ isAuthenticated, jwt: token });
}
