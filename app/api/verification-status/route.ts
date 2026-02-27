import { NextResponse } from "next/server";

// In production, this should query your database
// For now, we'll use a simple in-memory store (replace with DB)
const verifiedUsers = new Map<string, {
  address: string;
  nullifier: string;
  verifiedAt: number;
}>();

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Check if user is verified
  const verification = verifiedUsers.get(address.toLowerCase());
  
  return NextResponse.json({
    isVerified: !!verification,
    verifiedAt: verification?.verifiedAt || null,
  });
}

// Note: In production, replace this with database queries:
// const verification = await db.verifications.findUnique({
//   where: { address: address.toLowerCase() }
// });