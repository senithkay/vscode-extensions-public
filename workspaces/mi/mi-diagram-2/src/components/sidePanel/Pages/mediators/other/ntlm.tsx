/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';

const cardStyle = {
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const NTLMForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "usernameValueType": "LITERAL",
                "passwordValueType": "LITERAL",
                "hostValueType": "LITERAL",
                "domainValueType": "LITERAL",
                "ntlmVersionValueType": "LITERAL"
            });
        }
    }, [sidePanelContext.formValues]);

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.NTLM, formValues);
            // const xml=""
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: xml
            });
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                isOpen: false,
                isEditing: false,
                formValues: undefined,
                nodeRange: undefined,
                operationName: undefined
            });
        }
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "description": (e?: any) => validateField("description", e, false),
        "username": (e?: any) => validateField("username", e, false),
        "password": (e?: any) => validateField("password", e, false),
        "host": (e?: any) => validateField("host", e, false),
        "domain": (e?: any) => validateField("domain", e, false),
        "ntlmVersion": (e?: any) => validateField("ntlmVersion", e, false),
        "usernameValueType": (e?: any) => validateField("usernameValueType", e, false),
        "passwordValueType": (e?: any) => validateField("passwordValueType", e, false),
        "hostValueType": (e?: any) => validateField("hostValueType", e, false),
        "domainValueType": (e?: any) => validateField("domainValueType", e, false),
        "ntlmVersionValueType": (e?: any) => validateField("ntlmVersionValueType", e, false),

    };

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
        let error;
        if (isRequired && !value) {
            error = "This field is required";
        } else if (validation === "e-mail" && !value.match(emailRegex)) {
            error = "Invalid e-mail address";
        } else if (validation === "nameWithoutSpecialCharactors" && !value.match(nameWithoutSpecialCharactorsRegex)) {
            error = "Invalid name";
        } else if (validation === "custom" && !value.match(regex)) {
            error = "Invalid input";
        } else {
            delete newErrors[id];
            setErrors(newErrors);
        }
        setErrors({ ...errors, [id]: error });
        return error;
    };

    return (
        <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

                <Field>
                    <label>Username Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["usernameValueType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "usernameValueType": e });
                        formValidators["usernameValueType"](e);
                    }} />
                    {errors["usernameValueType"] && <Error>{errors["usernameValueType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Username"
                        size={50}
                        placeholder=""
                        value={formValues["username"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "username": e });
                            formValidators["username"](e);
                        }}
                        required={false}
                    />
                    {errors["username"] && <Error>{errors["username"]}</Error>}
                </Field>

                <Field>
                    <label>Password Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["passwordValueType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "passwordValueType": e });
                        formValidators["passwordValueType"](e);
                    }} />
                    {errors["passwordValueType"] && <Error>{errors["passwordValueType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Password"
                        size={50}
                        placeholder=""
                        value={formValues["password"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "password": e });
                            formValidators["password"](e);
                        }}
                        required={false}
                    />
                    {errors["password"] && <Error>{errors["password"]}</Error>}
                </Field>

                <Field>
                    <label>Host Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["hostValueType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "hostValueType": e });
                        formValidators["hostValueType"](e);
                    }} />
                    {errors["hostValueType"] && <Error>{errors["hostValueType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Host"
                        size={50}
                        placeholder=""
                        value={formValues["host"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "host": e });
                            formValidators["host"](e);
                        }}
                        required={false}
                    />
                    {errors["host"] && <Error>{errors["host"]}</Error>}
                </Field>

                <Field>
                    <label>Domain Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["domainValueType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "domainValueType": e });
                        formValidators["domainValueType"](e);
                    }} />
                    {errors["domainValueType"] && <Error>{errors["domainValueType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Domain"
                        size={50}
                        placeholder=""
                        value={formValues["domain"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "domain": e });
                            formValidators["domain"](e);
                        }}
                        required={false}
                    />
                    {errors["domain"] && <Error>{errors["domain"]}</Error>}
                </Field>

                <Field>
                    <label>NTLM Version Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} value={formValues["ntlmVersionValueType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "ntlmVersionValueType": e });
                        formValidators["ntlmVersionValueType"](e);
                    }} />
                    {errors["ntlmVersionValueType"] && <Error>{errors["ntlmVersionValueType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="NTLM Version"
                        size={50}
                        placeholder=""
                        value={formValues["ntlmVersion"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "ntlmVersion": e });
                            formValidators["ntlmVersion"](e);
                        }}
                        required={false}
                    />
                    {errors["ntlmVersion"] && <Error>{errors["ntlmVersion"]}</Error>}
                </Field>

            </ComponentCard>


            <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Button
                    appearance="primary"
                    onClick={onClick}
                >
                    Submit
                </Button>
            </div>

        </div>
    );
};

export default NTLMForm; 
