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
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const ScriptForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "scriptLanguage": "js",
                "scriptType": "INLINE",
                "keyType": "STATIC_KEY",
                "scriptKeys": [] as string[][],
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
            if (formValues["scriptType"] == "INLINE") {
                const keysToInclude = ["scriptLanguage", "scriptType", "scriptBody", "description"];
                setFormValues(filterFormValues(formValues, keysToInclude, null));
            } else {
                const keysToExclude = ["scriptBody", formValues["keyType"] == "STATIC_KEY" ? "scriptDynamicKey" : "scriptStaticKey"];
                setFormValues(filterFormValues(formValues, null, keysToExclude));
            }
            const xml = getXML(MEDIATORS.SCRIPT, formValues);
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
        "scriptLanguage": (e?: any) => validateField("scriptLanguage", e, false),
        "scriptType": (e?: any) => validateField("scriptType", e, false),
        "mediateFunction": (e?: any) => validateField("mediateFunction", e, false),
        "keyType": (e?: any) => validateField("keyType", e, false),
        "keyName": (e?: any) => validateField("keyName", e, false),
        "keyValue": (e?: any) => validateField("keyValue", e, false),
        "scriptStaticKey": (e?: any) => validateField("scriptStaticKey", e, false),
        "scriptDynamicKey": (e?: any) => validateField("scriptDynamicKey", e, false),
        "scriptBody": (e?: any) => validateField("scriptBody", e, false),
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
                <label>Script Language</label>
                <AutoComplete items={["js", "rb", "groovy", "nashornJs"]} value={formValues["scriptLanguage"]} onValueChange={(e: any) => {
                    setFormValues({ ...formValues, "scriptLanguage": e });
                    formValidators["scriptLanguage"](e);
                }} />
                {errors["scriptLanguage"] && <Error>{errors["scriptLanguage"]}</Error>}
            </Field>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Script Type</h3>

                <Field>
                    <label>Script Type</label>
                    <AutoComplete items={["INLINE", "REGISTRY_REFERENCE"]} value={formValues["scriptType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "scriptType": e });
                        formValidators["scriptType"](e);
                    }} />
                    {errors["scriptType"] && <Error>{errors["scriptType"]}</Error>}
                </Field>

                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="Mediate Function"
                            size={50}
                            placeholder=""
                            value={formValues["mediateFunction"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "mediateFunction": e });
                                formValidators["mediateFunction"](e);
                            }}
                            required={false}
                        />
                        {errors["mediateFunction"] && <Error>{errors["mediateFunction"]}</Error>}
                    </Field>
                }

                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <label>Key Type</label>
                        <AutoComplete items={["STATIC_KEY", "DYNAMIC_KEY"]} value={formValues["keyType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "keyType": e });
                            formValidators["keyType"](e);
                        }} />
                        {errors["keyType"] && <Error>{errors["keyType"]}</Error>}
                    </Field>
                }
                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "registry_reference" &&
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Script Keys</h3>

                        {/* <Field>
                           <TextField
                               label="Key Name"
                               size={50}
                               placeholder=""
                               value={formValues["keyName"]}
                               onChange={(e: any) => {
                                   setFormValues({ ...formValues, "keyName": e });
                                   formValidators["keyName"](e);
                               }}
                               required={false}
                           />
                           {errors["keyName"] && <Error>{errors["keyName"]}</Error>}
                       </Field> */}

                        <Field>
                            <TextField
                                label="Key Value"
                                size={50}
                                placeholder=""
                                value={formValues["keyValue"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "keyValue": e });
                                    formValidators["keyValue"](e);
                                }}
                                required={false}
                            />
                            {errors["keyValue"] && <Error>{errors["keyValue"]}</Error>}
                        </Field>


                        <div style={{ textAlign: "right", marginTop: "10px" }}>
                            <Button appearance="primary" onClick={() => {
                                if (!(validateField("keyName", formValues["keyName"], true) || validateField("keyValue", formValues["keyValue"], true))) {
                                    setFormValues({
                                        ...formValues, "keyName": undefined, "keyValue": undefined,
                                        "scriptKeys": [...formValues["scriptKeys"], [formValues["keyValue"]]]
                                    });
                                }
                            }}>
                                Add
                            </Button>
                        </div>
                        {formValues["scriptKeys"] && formValues["scriptKeys"].length > 0 && (
                            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                                <h3>Script Keys Table</h3>
                                <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                                    <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                        {/* <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                           Name
                                       </VSCodeDataGridCell> */}
                                        {/* <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                           Value Type
                                       </VSCodeDataGridCell> */}
                                        <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                            Value
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                    {formValues["scriptKeys"].map((property: string, index: string) => (
                                        <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                            {/* <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                               {property[0]}
                                           </VSCodeDataGridCell> */}
                                            {/* <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                               {property[1]}
                                           </VSCodeDataGridCell> */}
                                            <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                                {property[0]}
                                            </VSCodeDataGridCell>
                                        </VSCodeDataGridRow>
                                    ))}
                                </VSCodeDataGrid>
                            </ComponentCard>
                        )}
                    </ComponentCard>
                }
                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "registry_reference" && formValues["keyType"] && formValues["keyType"].toLowerCase() == "static_key" &&
                    <Field>
                        <TextField
                            label="Script Static Key"
                            size={50}
                            placeholder=""
                            value={formValues["scriptStaticKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "scriptStaticKey": e });
                                formValidators["scriptStaticKey"](e);
                            }}
                            required={false}
                        />
                        {errors["scriptStaticKey"] && <Error>{errors["scriptStaticKey"]}</Error>}
                    </Field>
                }

                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "registry_reference" && formValues["keyType"] && formValues["keyType"].toLowerCase() == "dynamic_key" &&
                    <Field>
                        <TextField
                            label="Script Dynamic Key"
                            size={50}
                            placeholder=""
                            value={formValues["scriptDynamicKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "scriptDynamicKey": e });
                                formValidators["scriptDynamicKey"](e);
                            }}
                            required={false}
                        />
                        {errors["scriptDynamicKey"] && <Error>{errors["scriptDynamicKey"]}</Error>}
                    </Field>
                }

                {formValues["scriptType"] && formValues["scriptType"].toLowerCase() == "inline" &&
                    <Field>
                        <TextField
                            label="Script Body"
                            size={50}
                            placeholder=""
                            value={formValues["scriptBody"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "scriptBody": e });
                                formValidators["scriptBody"](e);
                            }}
                            required={false}
                        />
                        {errors["scriptBody"] && <Error>{errors["scriptBody"]}</Error>}
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


            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
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

export default ScriptForm; 
