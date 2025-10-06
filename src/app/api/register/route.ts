import {NextRequest, NextResponse} from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST (req: NextRequest) {
    console.log('Registration request received');

    try {
        const body = await req.json();
        const {name, email, password} = body;

        if (!name || !email || !password) {
            return NextResponse.json({
                error: 'Name, email and password are required'
            }, {status: 400});
        }

        console.log('Connecting to MongoDB...');
        await connectMongoDB();

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating user...');
        await User.create({name, email, password: hashedPassword});
        console.log('User created successfully:', {name, email});

        return NextResponse.json({
            message: 'Registration successful',
            user: {name, email}
        }, {status: 201});
    } catch (error: unknown) {
        console.log('Registration error:', error);
        
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
