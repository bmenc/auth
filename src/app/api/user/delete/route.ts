import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/User';
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectMongoDB();
    let user = null;
    const sessionUser = session.user as { id?: string; email?: string; name?: string };
    if (sessionUser.id) {
      user = await User.findById(sessionUser.id);
    }
    if (!user) {
      user = await User.findOne({ email: session.user.email });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await User.findByIdAndDelete(user._id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
