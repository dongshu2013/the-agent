import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simplified middleware example
  // In a real application, you would verify the session/token here
  // For this example, we're just demonstrating the concept
  
  // Add your authentication logic here if needed
  // For now, we'll just let Next.js handle client-side auth redirects
  // console.log('middleware', request);
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/profile/:path*'],
};
