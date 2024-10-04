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
import { Range, TagRange } from '@wso2-enterprise/mi-syntax-tree/lib/src';

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

const EntitlementForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "callbackHandler": "UT",
                "entitlementClientType": "SOAP - Basic Auth (WSO2 IS 4.0.0 or later)",
                "onAcceptSequenceType": "ANONYMOUS",
                "onRejectSequenceType": "ANONYMOUS",
                "obligationsSequenceType": "ANONYMOUS",
                "adviceSequenceType": "ANONYMOUS",
                "newMediator": true
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

            if (formValues["newMediator"]) {
                await applyEdit(formValues, props.nodePosition);
            } else {
                const ranges = formValues["ranges"];
                const keys = Object.keys(ranges);

                keys.sort((a, b) => {
                    const rangeA = ranges[a]?.startTagRange?.start?.line;
                    const rangeB = ranges[b]?.startTagRange?.start?.line;
                    if (rangeA == undefined && rangeB == undefined) return 0;
                    if (rangeA == undefined) return 1;
                    if (rangeB == undefined) return -1;
                    if (rangeA < rangeB) return 1;
                    if (rangeA > rangeB) return -1;
                    return 0;
                });

                for (let key of keys) {
                    const range: TagRange = ranges[key];
                    switch (key) {
                        case "entitlement":
                            const editRange: Range = range.startTagRange;
                            const data = { ...formValues, "editEntitlement": true }
                            await applyEdit(data, editRange, true);
                            break;
                        default:
                            let sequenceType;
                            if (key == "accept") sequenceType = formValues["onAcceptSequenceType"];
                            else if (key == "reject") sequenceType = formValues["onRejectSequenceType"];
                            else if (key == "obligation") sequenceType = formValues["obligationsSequenceType"];
                            else if (key == "advice") sequenceType = formValues["adviceSequenceType"];
                            if (range) {
                                if (sequenceType == "REGISTRY_REFERENCE") {
                                    const data = { ...formValues, ["remove" + key.charAt(0).toUpperCase() + key.substring(1)]: true }
                                    const editRange: Range = { start: range.startTagRange.start, end: range.endTagRange.end ? range.endTagRange.end : range.startTagRange.end }
                                    await applyEdit(data, editRange, true);
                                }
                            } else {
                                if (sequenceType == "ANONYMOUS") {
                                    const data = { ...formValues, ["add" + key.charAt(0).toUpperCase() + key.substring(1)]: true }
                                    const editRange: Range = { start: ranges["entitlement"].startTagRange.end, end: ranges["entitlement"].startTagRange.end }
                                    await applyEdit(data, editRange, true);
                                }
                            }
                    }
                }
            }
            await rpcClient.getMiDiagramRpcClient().rangeFormat({ uri: props.documentUri, range: props.nodePosition });
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

    const applyEdit = async (data: { [key: string]: any }, range: Range, disableFormatting: boolean = false) => {
        const xml = getXML(MEDIATORS.ENTITLEMENT, data);
        await rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: range, text: xml, disableFormatting: disableFormatting
        });
    }

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "entitlementServerURL": (e?: any) => validateField("entitlementServerURL", e, false),
        "username": (e?: any) => validateField("username", e, false),
        "password": (e?: any) => validateField("password", e, false),
        "callbackHandler": (e?: any) => validateField("callbackHandler", e, false),
        "callbackClassName": (e?: any) => validateField("callbackClassName", e, false),
        "entitlementClientType": (e?: any) => validateField("entitlementClientType", e, false),
        "thriftHost": (e?: any) => validateField("thriftHost", e, false),
        "thriftPort": (e?: any) => validateField("thriftPort", e, false),
        "onAcceptSequenceType": (e?: any) => validateField("onAcceptSequenceType", e, false),
        "onAcceptSequenceKey": (e?: any) => validateField("onAcceptSequenceKey", e, false),
        "onRejectSequenceType": (e?: any) => validateField("onRejectSequenceType", e, false),
        "onRejectSequenceKey": (e?: any) => validateField("onRejectSequenceKey", e, false),
        "obligationsSequenceType": (e?: any) => validateField("obligationsSequenceType", e, false),
        "obligationsSequenceKey": (e?: any) => validateField("obligationsSequenceKey", e, false),
        "adviceSequenceType": (e?: any) => validateField("adviceSequenceType", e, false),
        "adviceSequenceKey": (e?: any) => validateField("adviceSequenceKey", e, false),
        "description": (e?: any) => validateField("description", e, false),

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
                        label="Entitlement Server URL"
                        size={50}
                        placeholder=""
                        value={formValues["entitlementServerURL"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "entitlementServerURL": e });
                            formValidators["entitlementServerURL"](e);
                        }}
                        required={false}
                    />
                    {errors["entitlementServerURL"] && <Error>{errors["entitlementServerURL"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Username"
                        size={50}
                        placeholder=""
                        value={formValues["username"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "username": e });
                            formValidators["username"](e);
                        }}
                        required={false}
                    />
                    {errors["username"] && <Error>{errors["username"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Password"
                        size={50}
                        placeholder=""
                        value={formValues["password"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "password": e });
                            formValidators["password"](e);
                        }}
                        required={false}
                    />
                    {errors["password"] && <Error>{errors["password"]}</Error>}
                </Field>

                <Field>
                    <label>Callback Handler</label>
                    <AutoComplete items={["UT", "X509", "SAML", "Kerberos", "Custom"]} value={formValues["callbackHandler"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "callbackHandler": e });
                        formValidators["callbackHandler"](e);
                    }} />
                    {errors["callbackHandler"] && <Error>{errors["callbackHandler"]}</Error>}
                </Field>

                {formValues["callbackHandler"] && formValues["callbackHandler"].toLowerCase() == "custom" &&
                    <Field>
                        <TextField
                            label="Callback Class Name"
                            size={50}
                            placeholder=""
                            value={formValues["callbackClassName"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "callbackClassName": e });
                                formValidators["callbackClassName"](e);
                            }}
                            required={false}
                        />
                        {errors["callbackClassName"] && <Error>{errors["callbackClassName"]}</Error>}
                    </Field>
                }

                <Field>
                    <label>Entitlement Client Type</label>
                    <AutoComplete items={["SOAP - Basic Auth (WSO2 IS 4.0.0 or later)", "THRIFT", "SOAP - Authentication Admin (WSO2 IS 3.2.3 or earlier)", "WSXACML"]} value={formValues["entitlementClientType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "entitlementClientType": e });
                        formValidators["entitlementClientType"](e);
                    }} />
                    {errors["entitlementClientType"] && <Error>{errors["entitlementClientType"]}</Error>}
                </Field>

                {formValues["entitlementClientType"] && formValues["entitlementClientType"].toLowerCase() == "thrift" &&
                    <Field>
                        <TextField
                            label="Thrift Host"
                            size={50}
                            placeholder=""
                            value={formValues["thriftHost"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "thriftHost": e });
                                formValidators["thriftHost"](e);
                            }}
                            required={false}
                        />
                        {errors["thriftHost"] && <Error>{errors["thriftHost"]}</Error>}
                    </Field>
                }

                {formValues["entitlementClientType"] && formValues["entitlementClientType"].toLowerCase() == "thrift" &&
                    <Field>
                        <TextField
                            label="Thrift Port"
                            size={50}
                            placeholder=""
                            value={formValues["thriftPort"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "thriftPort": e });
                                formValidators["thriftPort"](e);
                            }}
                            required={false}
                        />
                        {errors["thriftPort"] && <Error>{errors["thriftPort"]}</Error>}
                    </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>On Acceptance</h3>

                    <Field>
                        <label>On Accept Sequence Type</label>
                        <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["onAcceptSequenceType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "onAcceptSequenceType": e });
                            formValidators["onAcceptSequenceType"](e);
                        }} />
                        {errors["onAcceptSequenceType"] && <Error>{errors["onAcceptSequenceType"]}</Error>}
                    </Field>

                    {formValues["onAcceptSequenceType"] && formValues["onAcceptSequenceType"].toLowerCase() == "registry_reference" &&
                        <Field>
                            <TextField
                                label="On Accept SequenceKey"
                                size={50}
                                placeholder=""
                                value={formValues["onAcceptSequenceKey"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "onAcceptSequenceKey": e });
                                    formValidators["onAcceptSequenceKey"](e);
                                }}
                                required={false}
                            />
                            {errors["onAcceptSequenceKey"] && <Error>{errors["onAcceptSequenceKey"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>On Rejection</h3>

                    <Field>
                        <label>On Reject Sequence Type</label>
                        <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["onRejectSequenceType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "onRejectSequenceType": e });
                            formValidators["onRejectSequenceType"](e);
                        }} />
                        {errors["onRejectSequenceType"] && <Error>{errors["onRejectSequenceType"]}</Error>}
                    </Field>

                    {formValues["onRejectSequenceType"] && formValues["onRejectSequenceType"].toLowerCase() == "registry_reference" &&
                        <Field>
                            <TextField
                                label="On Reject SequenceKey"
                                size={50}
                                placeholder=""
                                value={formValues["onRejectSequenceKey"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "onRejectSequenceKey": e });
                                    formValidators["onRejectSequenceKey"](e);
                                }}
                                required={false}
                            />
                            {errors["onRejectSequenceKey"] && <Error>{errors["onRejectSequenceKey"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Obligation</h3>

                    <Field>
                        <label>Obligations Sequence Type</label>
                        <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["obligationsSequenceType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "obligationsSequenceType": e });
                            formValidators["obligationsSequenceType"](e);
                        }} />
                        {errors["obligationsSequenceType"] && <Error>{errors["obligationsSequenceType"]}</Error>}
                    </Field>

                    {formValues["obligationsSequenceType"] && formValues["obligationsSequenceType"].toLowerCase() == "registry_reference" &&
                        <Field>
                            <TextField
                                label="Obligations SequenceKey"
                                size={50}
                                placeholder=""
                                value={formValues["obligationsSequenceKey"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "obligationsSequenceKey": e });
                                    formValidators["obligationsSequenceKey"](e);
                                }}
                                required={false}
                            />
                            {errors["obligationsSequenceKey"] && <Error>{errors["obligationsSequenceKey"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Advice</h3>

                    <Field>
                        <label>Advice Sequence Type</label>
                        <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["adviceSequenceType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "adviceSequenceType": e });
                            formValidators["adviceSequenceType"](e);
                        }} />
                        {errors["adviceSequenceType"] && <Error>{errors["adviceSequenceType"]}</Error>}
                    </Field>

                    {formValues["adviceSequenceType"] && formValues["adviceSequenceType"].toLowerCase() == "registry_reference" &&
                        <Field>
                            <TextField
                                label="Advice SequenceKey"
                                size={50}
                                placeholder=""
                                value={formValues["adviceSequenceKey"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "adviceSequenceKey": e });
                                    formValidators["adviceSequenceKey"](e);
                                }}
                                required={false}
                            />
                            {errors["adviceSequenceKey"] && <Error>{errors["adviceSequenceKey"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
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

export default EntitlementForm; 
