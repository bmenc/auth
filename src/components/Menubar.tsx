"use client";
import { Navbar, NavbarGroup, Alignment, Popover, Menu, Button, MenuItem, Divider } from '@blueprintjs/core';

const menus = {
  File: ["New","--", "Upload", "Export"]
};

const handleMenuClick = (item: string) => {
    switch (item) {
        case "New":
            alert("Nuevo archivo");
            break;
        case "Upload":
            alert("Abrir archivo");
            break;
        case "Export":
            alert("Exportar archivo");
            break;
    }
}

export function Menubar() {
    return (
        <Navbar className="bg-gray-100 h-8 flex p-0 z-10">
            <NavbarGroup align={Alignment.START} className="h-full flex items-center">
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
                                            onClick={() => handleMenuClick(item)}
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
        </Navbar>
    );
}
