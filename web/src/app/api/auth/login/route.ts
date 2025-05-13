import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdmin } from "@/lib/firebase-admin";

// JWT 密钥，应该放在环境变量中
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  console.log("idToken ====.>>. ", idToken);

  try {
    // 验证 Google ID token
    const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 生成自定义 JWT token
    const token = jwt.sign(
      {
        uid,
        email,
        name,
        picture,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({ jwt: token });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}
