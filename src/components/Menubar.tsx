"use client";
import { useRouter } from "next/navigation";
import { Navbar, NavbarGroup, Alignment, Popover, Menu, Button, MenuItem, Divider } from '@blueprintjs/core';
import { signOut, useSession } from 'next-auth/react';
export function Menubar() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const menus = {
        Projects: ["Portfolio"],
        Settings: ["Preferences",],
    };
    const handleMenuClick = (item: string, router: { push: (path: string) => void }) => {
        switch (item) {
            case "Builder":
                router.push("/builder");
                break;
            case "Preferences":
                router.push("/settings");
                break;
        }
    }
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
        <Navbar className="bg-gray-100 h-8 p-0 z-10">
            <NavbarGroup align={Alignment.START} className="h-full flex items-center">
                <Button
                    minimal
                    onClick={() => router.push("/home")}
                >
                    Home
                </Button>
                {Object.entries(menus).map(([menuName, items]) => (
                    <Popover
                        key={menuName}
                        content={
                            <Menu>
                                {items.map((item, index) =>
                                    item === "--" ? (
                                        <Divider key={index} />
                                    ) : (
                                        <MenuItem
                                            key={item}
                                            text={item}
                                            onClick={() => handleMenuClick(item, router)}
                                        />
                                    )
                                )}
                            </Menu>
                        }
                        position="bottom-right"
                        minimal
                    >
                        <Button minimal>{menuName}</Button>
                    </Popover>
                ))}
            </NavbarGroup>
            <NavbarGroup align={Alignment.END} className="h-full flex items-center">
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
                            <Divider />
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
                    <Button icon="cog" minimal />
                </Popover>
            </NavbarGroup>
        </Navbar>
    );
}
