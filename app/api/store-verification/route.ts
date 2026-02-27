import { NextResponse } from "next/server";

// In production, this should use your database
// For now, we'll use a simple in-memory store (replace with DB)
const verifiedUsers = new Map<string, {
  address: string;
  nullifier: string;
  verifiedAt: number;
}>();

export async function POST(request: Request): Promise<Response> {
  const { address, nullifier, verified } = await request.json();

  if (!address || !nullifier) {
    return NextResponse.json(
      { error: 'Address and nullifier required' }, 
      { status: 400 }
    );
  }

  if (verified) {
    // Store verification
    verifiedUsers.set(address.toLowerCase(), {
      address: address.toLowerCase(),
      nullifier,
      verifiedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification stored successfully',
    });
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid verification data',
  });
}

// Note: In production, replace this with database operations:
// await db.verifications.upsert({
//   where: { address: address.toLowerCase() },
//   update: { nullifier, verifiedAt: new Date() },
//   create: { address: address.toLowerCase(), nullifier, verifiedAt: new Date() }
// });