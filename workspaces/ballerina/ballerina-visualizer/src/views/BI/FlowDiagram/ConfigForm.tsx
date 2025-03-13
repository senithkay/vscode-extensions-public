/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { FormGeneratorNew } from "../Forms/FormGeneratorNew";

const Container = styled.div`
    max-width: 600px;
    height: 100%;
    > div:last-child {
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const FormContainer = styled.div`
    > div:first-child {
        padding: 16px 0 0 0;
    }
`;

interface ConfigProps {
    formFields: FormField[];
    onSubmit: (data: FormField[], rawData: FormValues) => void;
    onBack?: () => void;
}

export function ConfigForm(props: ConfigProps) {
    const { rpcClient } = useRpcContext();

    const { formFields, onSubmit, onBack } = props;
    const [filePath, setFilePath] = useState<string>("");

    useEffect(() => {
        rpcClient.getVisualizerLocation().then((res) => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), "agents.bal").fsPath);
        });
    }, []);

    const handleSubmit = async (data: FormValues) => {
        formFields.forEach((val) => {
            if (val.type === "DROPDOWN_CHOICE") {
                val.dynamicFormFields[data[val.key]].forEach((dynamicField) => {
                    if (data[dynamicField.key]) {
                        dynamicField.value = data[dynamicField.key];
                    }
                });
                val.value = data[val.key];
            } else if (data[val.key]) {
                val.value = data[val.key];
            }
        });
        onSubmit(formFields, data);
    };

    // type field hide
    const typeField = formFields.find((field) => field.key === "type");
    if (typeField) {
        typeField.enabled = false;
    }
    // variable field disable
    const variableField = formFields.find((field) => field.key === "variable");
    if (variableField) {
        variableField.editable = false;
    }

    return (
        <Container>
            {formFields && formFields.length > 0 && (
                <FormContainer>
                    {filePath && (
                        <FormGeneratorNew
                            fileName={filePath}
                            targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                            fields={formFields}
                            onBack={onBack}
                            onSubmit={handleSubmit}
                            compact={true}
                        />
                    )}
                </FormContainer>
            )}
        </Container>
    );
}

export default ConfigForm;
