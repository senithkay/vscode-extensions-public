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
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, filterFormValues } from '../common';
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

const EJBForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            if (sidePanelContext.formValues["methodArguments"] == undefined) {
                sidePanelContext.formValues["methodArguments"] = [];
            }
            setFormValues({ ...formValues, ...sidePanelContext.formValues, "propertyValueType": "LITERAL" });
        } else {
            setFormValues({
                "remove": false,
                "methodArguments": [] as string[][],
                "propertyValueType": "LITERAL",
                "sessionIdType": "LITERAL",
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
            const keysToExclude = [formValues["sessionIdType"] == "EXPRESSION" ? "sessionIdLiteral" : "sessionIdExpression"];
            setFormValues(filterFormValues(formValues, null, keysToExclude));

            const xml = getXML(MEDIATORS.EJB, formValues);
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
        "beanstalk": (e?: any) => validateField("beanstalk", e, false),
        "class": (e?: any) => validateField("class", e, false),
        "method": (e?: any) => validateField("method", e, false),
        "remove": (e?: any) => validateField("remove", e, false),
        "target": (e?: any) => validateField("target", e, false),
        "jndiName": (e?: any) => validateField("jndiName", e, false),
        "propertyValueType": (e?: any) => validateField("propertyValueType", e, false),
        "propertyValue": (e?: any) => validateField("propertyValue", e, false),
        "propertyExpression": (e?: any) => validateField("propertyExpression", e, false),
        "sessionIdType": (e?: any) => validateField("sessionIdType", e, false),
        "sessionIdLiteral": (e?: any) => validateField("sessionIdLiteral", e, false),
        "sessionIdExpression": (e?: any) => validateField("sessionIdExpression", e, false),
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

            <Field>
                <TextField
                    label="Beanstalk"
                    size={50}
                    placeholder=""
                    value={formValues["beanstalk"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "beanstalk": e });
                        formValidators["beanstalk"](e);
                    }}
                    required={false}
                />
                {errors["beanstalk"] && <Error>{errors["beanstalk"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Class"
                    size={50}
                    placeholder=""
                    value={formValues["class"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "class": e });
                        formValidators["class"](e);
                    }}
                    required={false}
                />
                {errors["class"] && <Error>{errors["class"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Method"
                    size={50}
                    placeholder=""
                    value={formValues["method"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "method": e });
                        formValidators["method"](e);
                    }}
                    required={false}
                />
                {errors["method"] && <Error>{errors["method"]}</Error>}
            </Field>

            <Field>
                <VSCodeCheckbox type="checkbox" checked={formValues["remove"]} onChange={(e: any) => {
                    setFormValues({ ...formValues, "remove": e.target.checked });
                    formValidators["remove"](e);
                }
                }>Remove </VSCodeCheckbox>
                {errors["remove"] && <Error>{errors["remove"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Target"
                    size={50}
                    placeholder=""
                    value={formValues["target"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "target": e });
                        formValidators["target"](e);
                    }}
                    required={false}
                />
                {errors["target"] && <Error>{errors["target"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="JNDI Name"
                    size={50}
                    placeholder=""
                    value={formValues["jndiName"]}
                    onChange={(e: any) => {
                        setFormValues({ ...formValues, "jndiName": e });
                        formValidators["jndiName"](e);
                    }}
                    required={false}
                />
                {errors["jndiName"] && <Error>{errors["jndiName"]}</Error>}
            </Field>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Method Arguments</h3>

                {/* <Field>
                        <TextField
                            label="Property Name"
                            size={50}
                            placeholder=""
                            value={formValues["propertyName"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyName": e });
                                formValidators["propertyName"](e);
                            }}
                            required={false}
                        />
                        {errors["propertyName"] && <Error>{errors["propertyName"]}</Error>}
                    </Field> */}

                <Field>
                    <label>Property Value Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["propertyValueType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "propertyValueType": e });
                        formValidators["propertyValueType"](e);
                    }} />
                    {errors["propertyValueType"] && <Error>{errors["propertyValueType"]}</Error>}
                </Field>

                {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "literal" &&
                    <Field>
                        <TextField
                            label="Property Value"
                            size={50}
                            placeholder=""
                            value={formValues["propertyValue"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyValue": e });
                                formValidators["propertyValue"](e);
                            }}
                            required={false}
                        />
                        {errors["propertyValue"] && <Error>{errors["propertyValue"]}</Error>}
                    </Field>
                }

                {formValues["propertyValueType"] && formValues["propertyValueType"].toLowerCase() == "expression" &&
                    <Field>
                        <TextField
                            label="Property Expression"
                            size={50}
                            placeholder=""
                            value={formValues["propertyExpression"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyExpression": e });
                                formValidators["propertyExpression"](e);
                            }}
                            required={false}
                        />
                        {errors["propertyExpression"] && <Error>{errors["propertyExpression"]}</Error>}
                    </Field>
                }


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (formValues["propertyValueType"].toLowerCase() == "literal") {
                            if (!(validateField("propertyValue", formValues["propertyValue"], true))) {
                                setFormValues({
                                    ...formValues, "propertyName": undefined, "propertyValue": undefined,
                                    "methodArguments": [...formValues["methodArguments"], [formValues["propertyValueType"], formValues["propertyValue"]]]
                                });
                            }
                        } else if (formValues["propertyValueType"].toLowerCase() == "expression") {
                            if (!(validateField("propertyExpression", formValues["propertyExpression"], true))) {
                                setFormValues({
                                    ...formValues, "propertyName": undefined, "propertyExpression": undefined,
                                    "methodArguments": [...formValues["methodArguments"], [formValues["propertyValueType"], formValues["propertyExpression"]]]
                                });
                            }
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["methodArguments"] && formValues["methodArguments"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Method Arguments Table</h3>
                        <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                            <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                    Value Type
                                </VSCodeDataGridCell>
                                <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                    Value
                                </VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                            {formValues["methodArguments"].map((property: string, index: string) => (
                                <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                    {/* <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                    {property[0]}
                                </VSCodeDataGridCell> */}
                                    <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                        {property[0]}
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                        {property[1]}
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                            ))}
                        </VSCodeDataGrid>
                    </ComponentCard>
                )}
            </ComponentCard>
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Session</h3>

                <Field>
                    <label>Session Id Type</label>
                    <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["sessionIdType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sessionIdType": e });
                        formValidators["sessionIdType"](e);
                    }} />
                    {errors["sessionIdType"] && <Error>{errors["sessionIdType"]}</Error>}
                </Field>

                {formValues["sessionIdType"] && formValues["sessionIdType"].toLowerCase() == "literal" &&
                    <Field>
                        <TextField
                            label="Session Id Literal"
                            size={50}
                            placeholder=""
                            value={formValues["sessionIdLiteral"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sessionIdLiteral": e });
                                formValidators["sessionIdLiteral"](e);
                            }}
                            required={false}
                        />
                        {errors["sessionIdLiteral"] && <Error>{errors["sessionIdLiteral"]}</Error>}
                    </Field>
                }

                {formValues["sessionIdType"] && formValues["sessionIdType"].toLowerCase() == "expression" &&
                    <Field>
                        <TextField
                            label="Session Id Expression"
                            size={50}
                            placeholder=""
                            value={formValues["sessionIdExpression"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sessionIdExpression": e });
                                formValidators["sessionIdExpression"](e);
                            }}
                            required={false}
                        />
                        {errors["sessionIdExpression"] && <Error>{errors["sessionIdExpression"]}</Error>}
                    </Field>
                }

            </ComponentCard>

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

export default EJBForm; 
