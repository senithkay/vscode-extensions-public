/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { Meta, storiesOf } from "@storybook/react";
import { DrawerStack } from "./DrawerStack";
import { DrawerItem } from "./DrawerItem";

export default {
    title: 'Components/DrawerStack',
    component: DrawerStack
} as Meta;

const DrawerDefault = () => {
    const [drawers, setDrawers] = useState([{ id: 'drawer1', isOpen: true }]);
    const [selectedComponent, setSelectedComponent] = useState('drawer1');

    const changeSelectedDrawer = (id: string) => {
        setSelectedComponent(id);
    };

    const removeDrawer = (id: string) => {
        setDrawers(drawers =>
            drawers.map(drawer =>
                drawer.id === id ? { 
                    ...drawer,
                    isOpen: false
                } : drawer
            )
        );
        // To Animate the removal of drawer
        setTimeout(() => {
            setDrawers(drawers => drawers.filter(drawer => drawer.id !== id));
        }, 400);
    };

    const addDrawer = () => {
        const newId = `drawer${drawers.length + 1}`;
        setDrawers([...drawers, { id: newId, isOpen: true }]);
        setSelectedComponent(newId);
    };

    const drawersComp = drawers.map((drawer, index) => (
        <DrawerItem
            key={drawer.id}
            id={drawer.id}
            isSelected={drawer.id === selectedComponent}
            isOpen={drawer.isOpen}
        >
            <div>{`Content of ${drawer.id}`}</div>
            <button onClick={() => removeDrawer(drawer.id)}>Remove</button>
            {index === drawers.length - 1 && <button onClick={addDrawer}>Add New Drawer</button>}
        </DrawerItem>
    ))
    return (
        <>
            <DrawerStack
                drawers={drawers}
                onChangeDrawer={changeSelectedDrawer}
                selectedComponent={selectedComponent}
            >
                {drawersComp}
            </DrawerStack>
        </>
    );
};

storiesOf("DrawerStack").add("DrawerStackDefaullt", () => <DrawerDefault />, {
    layout: 'fullscreen'
});
