import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { field, value } = await request.json();
    if (!field || value === undefined) {
      return NextResponse.json({ error: 'Field and value required' }, { status: 400 });
    }
    const validFields = ['name', 'email', 'password'];
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
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
    const updateData: Record<string, string> = {};
    if (field === 'password') {
      if (value.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(value, 12);
    } else if (field === 'email') {
      const existingUser = await User.findOne({ email: value, _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json({ error: 'This email is already in use' }, { status: 400 });
      }
      updateData.email = value;
    } else if (field === 'name') {
      if (value.length < 3) {
        return NextResponse.json({ error: 'Name must be at least 3 characters' }, { status: 400 });
      }
      updateData.name = value;
    }
    await User.findByIdAndUpdate(user._id, updateData);
    return NextResponse.json({ message: 'User updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
