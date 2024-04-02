/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextArea, TextField } from '@wso2-enterprise/ui-toolkit';
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

const Wrapper = styled.div`
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[1].value;
    return result.trim();
};

const PayloadForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "Dropdown",
                label: "Argument Type",
                defaultValue: "Value",
                isRequired: false,
                values: ["Value", "Expression"]
            },
            {
                id: 1,
                type: "TextField",
                label: "Argument Value",
                defaultValue: "default",
                isRequired: false,
                enableCondition: [{ 0: "Value" }]
            },
            {
                id: 2,
                type: "TextField",
                label: "Argument Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 0: "Expression" }]
            },
            {
                id: 3,
                type: "Dropdown",
                label: "Evaluator",
                defaultValue: "xml",
                isRequired: false,
                values: ["xml", "json"],
                enableCondition: [{ 0: "Expression" }]
            },
            {
                id: 4,
                type: "Checkbox",
                label: "Literal",
                defaultValue: false,
                isRequired: false
            }]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map((param: any) => {
            return {
                ...param,
                key: param.parameters[0].value,
                value: generateDisplayValue(param),
                icon: "query"
            }
        })};
        setParams(modifiedParams);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["args"] && sidePanelContext.formValues["args"].length > 0 ) {
                const paramValues = sidePanelContext.formValues["args"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "argumentType",
                                type: "Dropdown",
                                value: property[0],
                                isRequired: false,
                                values: ["Value", "Expression"]
                            },
                            {
                                id: 1,
                                label: "argumentValue",
                                type: "TextField",
                                value: property[1],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "argumentExpression",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            },
                            {
                                id: 3,
                                label: "evaluator",
                                type: "Dropdown",
                                value: property[3],
                                isRequired: false,
                                values: ["xml", "json"]
                            },
                            {
                                id: 4,
                                label: "literal",
                                type: "Checkbox",
                                value: property[4],
                                isRequired: false
                            }
                        ],
                        key: property[0],
                        value: property[1],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "args": [] as string[][],
                "payloadFormat": "Inline",
                "mediaType": "json",
                "templateType": "default",
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
        formValues["args"] = params.paramValues.map(param => param.parameters.slice(0, 5).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 5).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.PAYLOAD, formValues);
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
       "payloadFormat": (e?: any) => validateField("payloadFormat", e, false),
       "mediaType": (e?: any) => validateField("mediaType", e, false),
       "templateType": (e?: any) => validateField("templateType", e, false),
       "payloadKey": (e?: any) => validateField("payloadKey", e, false),
       "payload": (e?: any) => validateField("payload", e, false),
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

            <Wrapper>
                <Field>
                    <label>Payload Format</label>
                    <AutoComplete items={["Inline", "Registry Reference"]} value={formValues["payloadFormat"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "payloadFormat": e });
                        formValidators["payloadFormat"](e);
                    }} />
                    {errors["payloadFormat"] && <Error>{errors["payloadFormat"]}</Error>}
                </Field>

                <Field>
                    <label>Media Type</label>
                    <AutoComplete items={["xml", "json", "text"]} value={formValues["mediaType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "mediaType": e });
                        formValidators["mediaType"](e);
                    }} />
                    {errors["mediaType"] && <Error>{errors["mediaType"]}</Error>}
                </Field>

                <Field>
                    <label>Template Type</label>
                    <AutoComplete items={["default", "freemarker"]} value={formValues["templateType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "templateType": e });
                        formValidators["templateType"](e);
                    }} />
                    {errors["templateType"] && <Error>{errors["templateType"]}</Error>}
                </Field>

                {formValues["payloadFormat"] && formValues["payloadFormat"].toLowerCase() == "registry reference" &&
                    <Field>
                        <TextField
                            label="Payload Key"
                            size={50}
                            placeholder=""
                            value={formValues["payloadKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "payloadKey": e });
                                formValidators["payloadKey"](e);
                            }}
                            required={false}
                        />
                        {errors["payloadKey"] && <Error>{errors["payloadKey"]}</Error>}
                    </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Payload</h3>

                    {formValues["payloadFormat"] && formValues["payloadFormat"].toLowerCase() == "inline" &&
                        <Field>
                        <TextArea
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "payload": e });
                                formValidators["payload"](e);
                            }}
                            placeholder="Type your payload here"
                            required={false}
                            value={formValues["payload"] ?? ""}
                            rows={5}
                            cols={45}
                        />
                        {errors["payload"] && <Error>{errors["payload"]}</Error>}
                        </Field>
                    }

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Args</h3>
                    {formValues["args"] && (
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange= {handleOnChange} />
                    )}
                    </ComponentCard>
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

            </Wrapper>


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

export default PayloadForm; 
