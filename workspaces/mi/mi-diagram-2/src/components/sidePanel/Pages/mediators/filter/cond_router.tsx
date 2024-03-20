/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
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

const ConditionalRouterForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "Checkbox",
                label: "Break After Route",
                defaultValue: false,
                isRequired: false
            },
            {
                id: 1,
                type: "TextField",
                label: "Target Sequence",
                defaultValue: "",
                isRequired: true,
            },
            {
                id: 2,
                type: "TextField",
                label: "Evaluator Expression",
                defaultValue: "<equal  type=\"param\" source=\"foo\" value=\"bar\"/>",
                isRequired: false,
            },]
    };

    const [params, setParams] = useState(paramConfigs);
    const handleOnChange = (params: any) => {
        setParams(params);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["conditionalRouteBranches"] && sidePanelContext.formValues["conditionalRouteBranches"].length > 0) {
                const paramValues = sidePanelContext.formValues["conditionalRouteBranches"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "breakAfterRoute",
                                type: "Checkbox",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "targetSequence",
                                type: "TextField",
                                value: property[1],
                                isRequired: true
                            },
                            {
                                id: 2,
                                label: "evaluatorExpression",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            }
                        ]
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "continueAfterRoute": false,
                "conditionalRouteBranches": [] as string[][],
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
        formValues["conditionalRouteBranches"] = params.paramValues.map(param => param.parameters.slice(0, 4).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 4).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.CONDITIONALROUTER, formValues);
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
        "continueAfterRoute": (e?: any) => validateField("continueAfterRoute", e, false),
        "breakAfterRoute": (e?: any) => validateField("breakAfterRoute", e, false),
        "targetSequence": (e?: any) => validateField("targetSequence", e, false),
        "evaluatorExpression": (e?: any) => validateField("evaluatorExpression", e, false),
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
                    <VSCodeCheckbox type="checkbox" checked={formValues["continueAfterRoute"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "continueAfterRoute": e.target.checked });
                        formValidators["continueAfterRoute"](e);
                    }
                    }>Continue After Route </VSCodeCheckbox>
                    {errors["continueAfterRoute"] && <Error>{errors["continueAfterRoute"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Conditional Route Branches</h3>
                    {formValues["conditionalRouteBranches"] && (
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange={handleOnChange} />
                    )}
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

            </ComponentCard>


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

export default ConditionalRouterForm; 
