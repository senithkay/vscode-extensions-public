/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { DropdownButton } from "./DropdownButton";
import { storiesOf } from "@storybook/react";
import Typography from "../Typography/Typography";
import styled from "@emotion/styled";
import { Icon } from "../Icon/Icon";

const IconWrapper = styled.div`
    height: 20px;
    width: 20px;
`;
const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const option1 = (
    <div>
        <Typography sx={{margin: '0 0 10px 0'}} variant="h4">Option 1</Typography>
        <Typography sx={{margin: 0}} variant="body2">This is the first option in the dropdown</Typography>
    </div>
);
const option2 = (
    <div>
        <Typography sx={{margin: '0 0 10px 0'}} variant="h4">Option 2</Typography>
        <Typography sx={{margin: 0}} variant="body2">This is the second option in the dropdown</Typography>
    </div>
);
const option3 = (
    <div>
        <Typography sx={{margin: '0 0 10px 0'}} variant="h4">Option 3</Typography>
        <Typography sx={{margin: 0}} variant="body2">This is the third option in the dropdown</Typography>
    </div>
);
const onSelect = (option: string) => {
    console.log(`Selected option: ${option}`);
};

const DropdownButtonWithComponent = () => {
    const [selectedItem, setSelectedItem] = useState<string>("Option 1");
    const handleOptionSelect = (option: string) => {
        setSelectedItem(option);
        console.log(`Selected option: ${option}`);
    };
    const buttonContent = (
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
            <IconWrapper>
                <Icon name="import" iconSx={{ fontSize: 22 }} />
            </IconWrapper>
            <TextWrapper>Import {selectedItem}</TextWrapper>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", paddingTop: "100px" }}>
            <div style={{ marginBottom: "10px" }}>
                <Typography  variant="h1">Dropdown Button Example</Typography>
                <Typography variant="h2">Select an option from the dropdown below:</Typography>
            </div>
            <DropdownButton
                tooltip="Select an option"
                dropDownAlign="top"
                selecteOption={selectedItem}
                buttonContent={buttonContent}
                selectIconSx={{marginRight: 10}}
                onOptionChange={handleOptionSelect}
                onClick={onSelect}
                options={[
                    {
                        content: option1,
                        value: "Option 1",
                    },
                    {
                        content: option2,
                        value: "Option 2",
                    },
                    {
                        content: option3,
                        value: "Option 3",
                    },
                ]}
                optionButtonSx={{ height: 30 }}
                iconName="chevron-down"
            />
        </div>
    );
};
storiesOf("DropdownButton").add("DropdownButtonWithComponent", () => <DropdownButtonWithComponent />);

const DropdownButtonWithStringContent = () => {
    const [selectedItem, setSelectedItem] = useState<string>("Option 1");
    const handleOptionSelect = (option: string) => {
        setSelectedItem(option);
        console.log(`Selected option: ${option}`);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" , paddingTop: "100px" }}>
            <div style={{ marginBottom: "10px" }}>
                <Typography variant="h1">Dropdown Button Example</Typography>
                <Typography variant="h2">Select an option from the dropdown below:</Typography>
            </div>
            <DropdownButton
                dropDownAlign="top"
                selecteOption={selectedItem}
                buttonContent={`Import ${selectedItem}`}
                onOptionChange={handleOptionSelect}
                onClick={onSelect}
                options={[
                    {
                        content: option1,
                        value: "Option 1",
                    },
                    {
                        content: option2,
                        value: "Option 2",
                    },
                    {
                        content: option3,
                        value: "Option 3",
                    },
                ]}
                optionButtonSx={{ height: 26 }}
                selectIconSx={{marginRight: 10}}
                iconName="chevron-down"
            />
        </div>
    );
}
storiesOf("DropdownButton").add("DropdownButtonWithStringContent", () => <DropdownButtonWithStringContent />);
