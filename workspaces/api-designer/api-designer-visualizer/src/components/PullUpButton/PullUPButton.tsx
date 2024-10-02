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
import { ReactNode, useState } from "react";

interface ContainerProps {
    sx?: any;
};

const Container = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    ${(props: PullUpProps) => props.sx};
`;

interface PullUpProps {
    options: string[];
    children: ReactNode;
    sx?: any;
}

export function PullUpButton(props: PullUpProps) {
    const { options, sx, children } = props;
    const [values, setValues] = useState<string[]>([]);

    const onChangeValues = (values: string[]) => {
        setValues(values);
    };

    return (
        <Container sx={sx}>
            <MultiSelect
                dropdownSx={{marginTop: 2}}
                options={options} displayValue={children}
                values={values}
                onChange={onChangeValues}
            />
        </Container>
    );
}
