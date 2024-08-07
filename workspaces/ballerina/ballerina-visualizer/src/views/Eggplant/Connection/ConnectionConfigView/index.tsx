/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";

const Container = styled.div`
    padding: 0 20px;
    width: 100%;
`;

interface ConnectionConfigViewProps {
    fields: FormField[];
    onSubmit: (data: FormValues) => void;
}

export function ConnectionConfigView(props: ConnectionConfigViewProps) {
    const { fields, onSubmit } = props;

    return (
        <Container>
            <Typography variant="h2">Connection Configuration</Typography>
            <Form formFields={fields} onSubmit={onSubmit} />
        </Container>
    );
}

export default ConnectionConfigView;
