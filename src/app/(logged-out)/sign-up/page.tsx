'use client';

import { Button, FormGroup, InputGroup, Callout, Intent } from "@/lib/blueprint";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function SignUpPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        document.title = "Sign Up - Blueprint App";
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const responseData = await res.json();

            if (res.ok) {
                setSuccess('Registration successful!');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                setTimeout(() => {
                    router.push('/sign-in');
                }, 1500);
            } else {
                setError(responseData.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setError('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h2 className="text-xl mb-4 font-bold">Create Account</h2>
            <form className="flex flex-col" onSubmit={handleSubmit} autoComplete="off">
                <FormGroup 
                    label="Name" 
                    labelFor="name-input"
                    intent={Intent.NONE}
                >
                    <InputGroup
                        id="name-input"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        autoComplete="off"
                        intent={Intent.NONE}
                    />
                </FormGroup>

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
                        autoComplete="new-email"
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
                        autoComplete="new-password"
                        intent={Intent.NONE}
                    />
                </FormGroup>

                <FormGroup 
                    label="Confirm Password" 
                    labelFor="confirmPassword-input"
                    intent={Intent.NONE}
                >
                    <InputGroup
                        id="confirmPassword-input"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        intent={Intent.NONE}
                    />
                </FormGroup>

                <Button 
                    type="submit" 
                    intent="success" 
                    text={isLoading ? "Creating account..." : "Register"} 
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
            
            {success && (
                <Callout intent="success" className="mt-4">
                    {success}
                </Callout>
            )}
            
            <p className="mt-4 text-sm">
                <span>Already have an account?</span>{' '}
                <Link href="/sign-in" className="text-blue-600 underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
