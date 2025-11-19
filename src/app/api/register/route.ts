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
        if (name.length < 3 || name.length > 50) {
            return NextResponse.json({
                error: 'Name must be between 3 and 50 characters'
            }, {status: 400});
        }
        if (password.length < 6) {
            return NextResponse.json({
                error: 'Password must be at least 6 characters'
            }, {status: 400});
        }
        const emailRegex = /.+\@.+\..+/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                error: 'Invalid email format'
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
        console.error('Registration error:', error);
        if((error as {code?: number}).code === 11000) {
            return NextResponse.json({
                error: 'User with this email or name already exists'
            }, {status: 409});
        }
        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                const mongooseError = error as {errors?: Record<string, {message?: string}>};
                const validationErrors = Object.values(mongooseError.errors || {}).map(err => err.message).join(', ');
                return NextResponse.json({
                    error: validationErrors || 'Validation error'
                }, {status: 400});
            }
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json({
                    error: 'Database configuration error. Please contact support.'
                }, {status: 500});
            }
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Registration failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, {status: 500});
    }
}
