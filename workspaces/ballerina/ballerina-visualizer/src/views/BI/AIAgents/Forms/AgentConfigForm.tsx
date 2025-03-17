/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
import { FormGeneratorNew } from "../../Forms/FormGeneratorNew";
import { FormHeader } from "../../../../components/FormHeader";

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
    padding-bottom: 15px;
`;

interface ConfigProps {
    formFields: FormField[];
    onSubmit: (data: FormField[]) => void;
    onBack?: () => void;
    formSubmitText?: string;
    formCancelText?: string;
    isEdit?: boolean;
}

export function AgentConfigForm(props: ConfigProps) {
    const { rpcClient } = useRpcContext();

    const { isEdit, formFields, onSubmit, onBack, formCancelText = "Back", formSubmitText = "Next" } = props;
    const [filePath, setFilePath] = useState<string>("");
    const [customFormFields, setCustomFormFields] = useState<FormField[]>([]);

    useEffect(() => {
        rpcClient.getVisualizerLocation().then((res) => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), "agents.bal").fsPath);
        });
    }, []);

    useEffect(() => {
        if (formFields && formFields.length > 0) {
            // Find the name field (variable) and systemPrompt field
            const nameField = formFields.find((field) => field.key === "variable");
            const systemPromptField = formFields.find((field) => field.key === "systemPrompt");

            // Create custom fields array
            const customFields: FormField[] = [];

            // Add name field
            if (nameField) {
                customFields.push({ ...nameField });
            }

            // Extract role and instruction from systemPrompt if it has a value
            let roleValue = "";
            let instructionValue = "";

            if (systemPromptField && systemPromptField.value) {
                try {
                    // Try to parse the systemPrompt value if it exists
                    const valueStr = systemPromptField.value.toString();
                    const roleMatch = valueStr.match(/role:\s*"([^"]*)"/);
                    const instructionsMatch = valueStr.match(/instructions:\s*"([^"]*)"/);

                    if (roleMatch && roleMatch[1]) {
                        roleValue = roleMatch[1];
                    }

                    if (instructionsMatch && instructionsMatch[1]) {
                        instructionValue = instructionsMatch[1];
                    }
                } catch (error) {
                    console.error("Error parsing systemPrompt value:", error);
                }
            }

            // Add role field
            customFields.push({
                key: "role",
                label: "Role",
                type: "STRING",
                optional: true,
                advanced: false,
                placeholder: "e.g. Customer Support Assistant",
                editable: true,
                enabled: true,
                documentation: "The role of the AI agent",
                valueType: "STRING",
                value: roleValue,
                valueTypeConstraint: "string",
                diagnostics: [],
                metadata: {
                    label: "Role",
                    description: "The role of the AI agent",
                },
            });

            // Add instruction field
            customFields.push({
                key: "instruction",
                label: "Instructions",
                type: "TEXTAREA",
                optional: false,
                advanced: false,
                placeholder: "Detailed instructions for the agent...",
                editable: true,
                enabled: true,
                documentation: "Detailed instructions for the agent",
                valueType: "STRING",
                value: instructionValue,
                valueTypeConstraint: "string",
                diagnostics: [],
                metadata: {
                    label: "Instructions",
                    description: "Detailed instructions for the agent",
                },
            });

            setCustomFormFields(customFields);
        }
    }, [formFields]);

    const handleSubmit = async (data: FormValues) => {
        // Create a copy of the original formFields
        const updatedFormFields = [...formFields];

        // Update the name field
        const nameFieldIndex = updatedFormFields.findIndex((field) => field.key === "variable");
        if (nameFieldIndex !== -1) {
            updatedFormFields[nameFieldIndex].value = data["variable"];
        }

        // Update the systemPrompt field with role and instruction
        const systemPromptIndex = updatedFormFields.findIndex((field) => field.key === "systemPrompt");
        if (systemPromptIndex !== -1) {
            // Create the systemPrompt value with role and instruction
            // Escape any quotes in the values to prevent syntax errors
            const roleValue = (data["role"] || "").replace(/"/g, '\\"');
            const instructionValue = (data["instruction"] || "").replace(/"/g, '\\"');
            const systemPromptValue = `{role: "${roleValue}", instructions: string \`${instructionValue}\`}`;
            updatedFormFields[systemPromptIndex].value = systemPromptValue;
        }

        // Keep all other fields as they were in the original formFields
        onSubmit(updatedFormFields);
    };

    console.log(">>> agent config form - formFields", formFields);
    console.log(">>> agent config form - customFormFields", customFormFields);

    return (
        <Container>
            {customFormFields && (
                <>
                    {customFormFields.length > 0 && (
                        <FormContainer>
                            {!isEdit && (
                                <FormHeader
                                    title={`Initialize AI Agent`}
                                    subtitle={`Name your AI Agent and define its core purpose`}
                                />
                            )}
                            {filePath && (
                                <FormGeneratorNew
                                    fileName={filePath}
                                    targetLineRange={{
                                        startLine: { line: 0, offset: 0 },
                                        endLine: { line: 0, offset: 0 },
                                    }}
                                    fields={customFormFields}
                                    nestedForm={true}
                                    onBack={onBack}
                                    onSubmit={handleSubmit}
                                    submitText={formSubmitText}
                                    cancelText={formCancelText}
                                    compact={true}
                                />
                            )}
                        </FormContainer>
                    )}
                </>
            )}
        </Container>
    );
}

export default AgentConfigForm;
