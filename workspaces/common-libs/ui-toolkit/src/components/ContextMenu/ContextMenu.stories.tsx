/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { storiesOf } from "@storybook/react";

import { ContextMenu } from ".";

const ComponentStory = () => {

    return (
        <ContextMenu menuItems={[{id: "", label: <>Test Item</>, onClick: () => {console.log("Item Selected")}}]}/>
    );
};

storiesOf("Context Menu").add("Horizontal Menu", () => <ComponentStory />);

const verticalIconStyles = {
    transform: "rotate(90deg)",
    ":hover": {
        backgroundColor: "var(--vscode-welcomePage-tileHoverBackground)",
    }
}

const VericleMenu = () => {

    return (
        <ContextMenu iconSx={verticalIconStyles} menuItems={[{id: "", label: <>Test Item</>, onClick: () => {console.log("Item Selected")}}]}/>
    );
};

storiesOf("Context Menu").add("Verticle Menu", () => <VericleMenu />);

const rounderIconStyles = {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    transform: "rotate(90deg)",
    border: "1px solid var(--vscode-dropdown-border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
}
const VericleMenuWithCircularBorder = () => {

    return (
        <ContextMenu iconSx={rounderIconStyles} menuItems={[{id: "", label: <>Test Item</>, onClick: () => {console.log("Item Selected")}}]}/>
    );
};

storiesOf("Context Menu").add("Vericle Menu With Circular Border", () => <VericleMenuWithCircularBorder />);
