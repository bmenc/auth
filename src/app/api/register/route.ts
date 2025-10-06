import {NextRequest, NextResponse} from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const {name, email, password} = body;
        if (!name || !email || !password) {
            return NextResponse.json({
                error: 'Name, email and password are required'
            }, {status: 400});
        }
        await connectMongoDB();
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({name, email, password: hashedPassword});
        return NextResponse.json({
            message: 'Registration successful',
            user: {name, email}
        }, {status: 201});
    } catch (error: unknown) {
        if((error as {code?: number}).code === 11000) {
            return NextResponse.json({
                error: 'User with this email or name already exists'
            }, {status: 409});
        }
        return NextResponse.json({
            error: 'Registration failed. Please try again.'
        }, {status: 500});
    }
}
