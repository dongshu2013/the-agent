import { authenticateRequest } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { isAuthenticated, uid, email } = await authenticateRequest(
        body.token
    );
    const signJwt = await adminAuth.createCustomToken(uid); 
    return NextResponse.json({ isAuthenticated, uid, email, signJwt });
}
