'use client';
import { useState, useEffect } from 'react';
import { Button, FormGroup, InputGroup, Callout, Spinner, Intent } from '@/lib/blueprint';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
export default function SignInPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { data: session } = useSession();
    useEffect(() => {
        document.title = "Sign In - Blueprint App";
    }, []);
    if (session) {
        router.push('/home');
        return (
            <div className="flex flex-col items-center justify-center">
                <Spinner size={50} />
                <p className="mt-4 text-gray-600">Redirecting to home...</p>
            </div>
        );
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });
            if (result?.error) {
                setError('Invalid email or password');
                setIsLoading(false);
            } else {
                router.push('/home');
            }
        } catch {
            setError('An error occurred during login');
            setIsLoading(false);
        }
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <Spinner size={50} />
                <p className="mt-4 text-gray-600">Signing in...</p>
            </div>
        );
    }
    return (
        <div>
            <h2 className="text-xl mb-4 font-bold">Sign In</h2>
            <form className="flex flex-col" onSubmit={handleSubmit} autoComplete="off">
                <FormGroup 
                    label="Email" 
                    labelFor="email-input"
                    intent={Intent.NONE}
                >
                    <InputGroup
                        id="email-input"
                        name="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        intent={Intent.NONE}
                    />
                </FormGroup>
                <FormGroup 
                    label="Password" 
                    labelFor="password-input"
                    intent={Intent.NONE}
                >
                    <InputGroup
                        id="password-input"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        intent={Intent.NONE}
                    />
                </FormGroup>
                <Button 
                    type="submit" 
                    intent="primary" 
                    text={isLoading ? "Signing in..." : "Sign In"} 
                    large 
                    fill
                    disabled={isLoading}
                />
            </form>
            {error && (
                <Callout intent="danger" className="mt-4">
                    {error}
                </Callout>
            )}
            <p className="mt-4 text-sm">
                <span>Don&apos;t have an account?</span>{' '}
                <Link href="/sign-up" className="text-blue-600 underline">
                    Create account
                </Link>
            </p>
        </div>
    )
}
