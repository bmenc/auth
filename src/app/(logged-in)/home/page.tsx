'use client';

import { useEffect } from 'react';
import { Button, Card, Navbar, NavbarGroup, Alignment, Popover, Menu, MenuItem, MenuDivider } from '@/lib/blueprint';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        document.title = "Home - Blueprint App";
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/sign-in' });
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        router.push('/sign-in');
        return null;
    }

    return (
        <div className="h-full flex flex-col">
            <Navbar className="bg-gray-100 h-8 p-2">
                <NavbarGroup align={Alignment.START} className='h-full flex items-center'>
                    <h1 className="font-semibold text-gray-800">Blueprint App</h1>
                </NavbarGroup>
                <NavbarGroup align={Alignment.END} className='h-full flex items-center'>
                    <Popover
                        content={
                            <Menu>
                                <MenuItem 
                                    icon="person" 
                                    text={`Name: ${session?.user?.name || 'N/A'}`} 
                                    disabled
                                />
                                <MenuItem 
                                    icon="envelope" 
                                    text={`Email: ${session?.user?.email || 'N/A'}`} 
                                    disabled
                                />
                                <MenuItem 
                                    icon="id-number" 
                                    text={`User ID: ${(session?.user as { id?: string })?.id || 'N/A'}`} 
                                    disabled
                                />
                                <MenuDivider />
                                <MenuItem 
                                    icon="log-out" 
                                    text="Log Out"
                                    onClick={handleLogout}
                                    shouldDismissPopover={true}
                                />
                            </Menu>
                        }
                        position="bottom-right"
                        minimal
                    >
                        <Button icon="cog" variant="minimal" />
                    </Popover>
                </NavbarGroup>
            </Navbar>

            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Blueprint App</h2>
                        <p className="text-gray-600">You are successfully authenticated!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold mb-4">User Information</h3>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
                                <p><strong>User ID:</strong> {(session?.user as { id?: string })?.id || 'N/A'}</p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button 
                                    text="View Profile" 
                                    intent="primary" 
                                    fill 
                                    disabled
                                />
                                <Button 
                                    text="Settings" 
                                    intent="none" 
                                    fill 
                                    disabled
                                />
                                <Button 
                                    text="Logout" 
                                    intent="danger" 
                                    fill 
                                    onClick={handleLogout}
                                />
                            </div>
                        </Card>
                    </div>

                    <Card className="mt-6 p-6">
                        <h3 className="text-xl font-semibold mb-4">About This App</h3>
                        <p className="text-gray-700 mb-4">
                            This is a simple authentication app built with Next.js 14, NextAuth.js, 
                            MongoDB, and Blueprint.js components.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">Technologies Used:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Next.js 14</li>
                                    <li>• NextAuth.js</li>
                                    <li>• MongoDB</li>
                                    <li>• Blueprint.js</li>
                                    <li>• TypeScript</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Features:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• User Registration</li>
                                    <li>• User Login</li>
                                    <li>• Protected Routes</li>
                                    <li>• Session Management</li>
                                    <li>• Responsive Design</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Security:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Password Hashing</li>
                                    <li>• JWT Sessions</li>
                                    <li>• CSRF Protection</li>
                                    <li>• Route Protection</li>
                                    <li>• Input Validation</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
