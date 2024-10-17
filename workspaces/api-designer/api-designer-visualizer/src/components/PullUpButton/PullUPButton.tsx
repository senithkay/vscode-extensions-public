/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { MultiSelect } from "@wso2-enterprise/ui-toolkit";
import { ReactNode } from "react";

interface ContainerProps {
    sx?: any;
};

const Container = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    ${(props: PullUpProps) => props.sx};
`;

interface PullUpProps {
    options: string[];
    children: ReactNode;
    selectedOptions?: string[];
    closeOnSelect?: boolean;
    onOptionChange?: (options: string[]) => void;
    sx?: any;
}

export function PullUpButton(props: PullUpProps) {
    const { options, sx, children, selectedOptions, closeOnSelect, onOptionChange } = props;

    const onChangeValues = (values: string[]) => {
        if (onOptionChange && closeOnSelect) {
            onOptionChange(values);
        }
    };

    return (
        <Container sx={sx}>
            <MultiSelect
                addHoverEffect
                closeOnSelect={closeOnSelect}
                dropdownSx={{marginTop: 2}}
                options={options}
                displayValue={children}
                values={selectedOptions}
                onChange={onChangeValues}
                onClosed={onOptionChange}
            />
        </Container>
    );
}
