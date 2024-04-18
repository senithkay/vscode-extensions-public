/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const SwitchForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues, "isSwitchChanged": false });
        } else {
            setFormValues({
                "caseBranches": [] as string[][],
                "caseRegex": ".*+",
                "isNewMediator": true
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
            if (formValues["isNewMediator"]) {
                await applyEdit(formValues, props.nodePosition);
            } else {
                const caseBranches = formValues["caseBranches"];
                const ranges = formValues["ranges"];
                if (caseBranches && caseBranches.length > 0) {
                    const lastCaseRange: TagRange = ranges?.lastCase;
                    let editRange: Range;
                    if (lastCaseRange) {
                        editRange = {
                            start: lastCaseRange.endTagRange.end ? lastCaseRange.endTagRange.end : lastCaseRange.startTagRange.end,
                            end: lastCaseRange.endTagRange.end ? lastCaseRange.endTagRange.end : lastCaseRange.startTagRange.end
                        }
                    } else {
                        editRange = {
                            start: ranges.switch.startTagRange.end,
                            end: ranges.switch.startTagRange.end
                        }
                    }
                    for (let i = caseBranches.length - 1; i >= 0; i--) {
                        const _case = caseBranches[i];
                        if (_case[3]) {
                            if (_case[1]) {
                                editRange = _case[1];
                            }
                            const data = { caseRegex: _case[0], caseSelfClosed: _case[2], "editCase": true };
                            await applyEdit(data, editRange);
                        }
                    }
                }
                if (formValues["isSwitchChanged"]) {
                    const data = { ...formValues, "editSwitch": true }
                    await applyEdit(data, ranges.switch.startTagRange);
                }
            }
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

    const applyEdit = async (data: { [key: string]: any }, range: Range) => {
        const xml = getXML(MEDIATORS.SWITCH, data);
        await rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: range, text: xml
        });
    }

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
        "caseRegex": (e?: any) => validateField("caseRegex", e, false),
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
                        label="Source XPath"
                        size={50}
                        placeholder=""
                        value={formValues["sourceXPath"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceXPath": e, "isSwitchChanged": true });
                            formValidators["sourceXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceXPath"] && <Error>{errors["sourceXPath"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Case Branches</h3>

                    <Field>
                        <TextField
                            label="Case Regex"
                            size={50}
                            placeholder=""
                            value={formValues["caseRegex"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "caseRegex": e });
                                formValidators["caseRegex"](e);
                            }}
                            required={false}
                        />
                        {errors["caseRegex"] && <Error>{errors["caseRegex"]}</Error>}
                    </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("caseRegex", formValues["caseRegex"], true))) {
                                setFormValues({
                                    ...formValues, "caseRegex": undefined,
                                    //"caseBranches": [caseRegex, range, isSelfClosed, add/edit?][]
                                    "caseBranches": [...formValues["caseBranches"], [formValues["caseRegex"], null, true, true]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["caseBranches"] && formValues["caseBranches"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Case Branches Table</h3>
                            <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                                <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                    <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                        Case Regex
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                                {formValues["caseBranches"].map((property: string, index: string) => (
                                    <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                        <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                            {property[0]}
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                ))}
                            </VSCodeDataGrid>
                        </ComponentCard>
                    )}
                </ComponentCard>
                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e, "isSwitchChanged": true });
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

export default SwitchForm; 
