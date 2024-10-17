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
import { Button, Codicon, Typography } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { BodyText } from "../../../styles";
import { Colors } from "../../../../resources/constants";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    > div:last-child {
        padding: 20px 0;
        height: calc(100vh - 160px);
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    color: ${Colors.ON_SURFACE};
`;

interface ConnectionConfigViewProps {
    name: string;
    fields: FormField[];
    onSubmit: (data: FormValues) => void;
    onBack?: () => void;
}

export function ConnectionConfigView(props: ConnectionConfigViewProps) {
    const { name, fields, onSubmit, onBack } = props;

    return (
        <Container>
            <Row>
                {onBack && (
                    <Button appearance="icon" onClick={onBack}>
                        <Codicon name="arrow-left" />
                    </Button>
                )}
                <Typography variant="h2">Configure {name} Connector</Typography>
            </Row>
            <BodyText>
                Provide the necessary configuration details for the selected connector to complete the setup.
            </BodyText>
            <Form formFields={fields} onSubmit={onSubmit} />
        </Container>
    );
}

export default ConnectionConfigView;
