/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useContext, useEffect, useState } from "react";

import { Grid } from "@material-ui/core";
import { FunctionDefinition, NodePosition, ObjectMethodDefinition, ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../../Contexts/Diagram";
import { checkVariableName } from "../../../../../../Portals/utils";
import { SelectDropdownWithButton } from "../../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { ExpressionEditorCustomTemplate } from "../../../../../FormFieldComponents/ExpressionEditor";
import { FormTextInput } from "../../../../../FormFieldComponents/TextField/FormTextInput";
import {
    VariableTypeInput,
    VariableTypeInputProps
} from "../../../../Components/VariableTypeInput";
import { Payload } from "../../types";
import { convertPayloadStringToPayload, extractPayloadFromSTNode, extractPayloadPositionFromST, payloadTypes } from "../../util";

import { useStyles } from './style';

interface PayloadEditorProps {
    payload?: string,
    disabled?: boolean,
    onChange?: (segment: Payload) => void;
    onError: (isError?: boolean) => void;
    targetPosition: NodePosition;
    model?: ResourceAccessorDefinition | FunctionDefinition | ObjectMethodDefinition;
    setIsValid?: (isValid: boolean) => void;
}

export function PayloadEditor(props: PayloadEditorProps) {
    const { payload, disabled, onChange, onError, targetPosition, model, setIsValid } = props;
    const { props: { stSymbolInfo } } = useContext(Context);
    const segment: Payload = convertPayloadStringToPayload(payload ? payload : "");
    const [validType, setValidType] = useState(false);
    const funcSignature = (model as ResourceAccessorDefinition)?.functionSignature;

    const classes = useStyles();
    const initValue: Payload = segment.type !== "" && segment.type !== "" ? { ...segment } : {
        name: "payload",
        type: ""
    };

    const payloadTypeArray: string[] = payloadTypes;
    if (!payloadTypeArray.includes(initValue.type)) {
        payloadTypeArray.push(initValue.type);
    }

    const [segmentState, setSegmentState] = useState<Payload>(initValue);
    const [payloadVarNameError, setPayloadVarNameError] = useState<string>("");
    const payloadNode = extractPayloadFromSTNode(funcSignature?.parameters);

    // TODO: Uncomment once payload suggestions are coming from LS
    // When creating new resource
    // let updateNodePosition: NodePosition = {
    //     ...targetPosition,
    //     endLine: 0,
    //     endColumn: 0,
    // };
    // let overrideTemplate: ExpressionEditorCustomTemplate = {
    //     defaultCodeSnippet: `resource function post tempResource(@http:Payload  ${segmentState?.name || 'tempPayload'}) {}`,
    //     targetColumn: 51
    // };

    // if (extractPayloadPositionFromST(funcSignature?.parameters)){
    //     // If @http:Payload already exists
    //     updateNodePosition = extractPayloadPositionFromST(funcSignature?.parameters);
    //     overrideTemplate = {
    //         defaultCodeSnippet: `@http:Payload  ${segmentState?.name || 'tempPayload'}`,
    //         targetColumn: 15
    //     }
    // }else if (funcSignature?.parameters.length > 0){
    //     // if some other payload already exists
    //     updateNodePosition = {
    //         ...funcSignature.openParenToken.position,
    //         startColumn: funcSignature.openParenToken.position.startColumn + 1,
    //     };
    //     overrideTemplate = {
    //         defaultCodeSnippet: `@http:Payload  ${segmentState?.name || 'tempPayload'},`,
    //         targetColumn: 15
    //     }
    // }else if (funcSignature?.parameters.length === 0){
    //     // If no payload exists
    //     updateNodePosition = {
    //         ...funcSignature.openParenToken.position,
    //         startColumn: funcSignature.openParenToken.position.startColumn + 1,
    //     };
    //     overrideTemplate = {
    //         defaultCodeSnippet: `@http:Payload  ${segmentState?.name || 'tempPayload'}`,
    //         targetColumn: 15
    //     }
    // }

    useEffect(() => {
        if (disabled) {
            onError(false);
            setPayloadVarNameError("");
        } else {
            const validPayload = validatePayloadNameValue(segmentState.name);
            onError(!validPayload);
        }
    }, [disabled]);

    const onChangeSegmentType = (text: string) => {
        const payloadSegment: Payload = {
            ...segmentState,
        };
        payloadSegment.type = text;
        setSegmentState(payloadSegment);
        if (onChange) {
            onChange(payloadSegment);
        }
    };

    const onChangeSegmentName = (text: string) => {
        const payloadSegment: Payload = {
            ...segmentState,
        };
        payloadSegment.name = text;
        setSegmentState(payloadSegment);
        if (onChange) {
            onChange(payloadSegment);
        }
    };

    const validatePayloadNameValue = (value: string) => {
        const varValidationResponse = checkVariableName("payload name", value,
            segmentState.name, stSymbolInfo);
        setPayloadVarNameError(varValidationResponse.message);
        if (varValidationResponse?.error) {
            onError(true);
            return false;
        }
        onError(false);
        return true;
    };

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setIsValid(!isInvalid);
    };

    // TODO: Uncomment once payload suggestions are coming from LS
    // const variableTypeConfig: VariableTypeInputProps = {
    //     displayName: '',
    //     value: segmentState?.type,
    //     onValueChange: onChangeSegmentType,
    //     validateExpression,
    //     position: updateNodePosition,
    //     overrideTemplate,
    //     hideLabel: true,
    //     disabled,
    //     initialDiagnostics: payloadNode?.typeData?.diagnostics,
    //     diagnosticsFilterExtraColumns: {
    //         end: 1 + segmentState?.name?.length,
    //     }
    // }
    const variableTypeConfig: VariableTypeInputProps = {
        displayName: '',
        value: segmentState?.type,
        onValueChange: onChangeSegmentType,
        validateExpression,
        hideLabel: true,
        disabled,
        position: targetPosition,
        initialDiagnostics: payloadNode?.typeData?.diagnostics,
        diagnosticsFilterExtraColumns: {
            end: 1 + segmentState?.name?.length,
        }
    }

    return (
        !disabled && (
            <div className={classes.segmentEditorWrap}>
                <div>
                    <Grid container={true} spacing={1}>
                        <Grid container={true} item={true} spacing={2}>
                            <Grid item={true} xs={5}>
                                <div className={classes.labelOfInputs}>
                                    Type
                                </div>
                            </Grid>
                            <Grid item={true} xs={7}>
                                <div className={classes.labelOfInputs}>
                                    Name
                                </div>
                            </Grid>
                        </Grid>
                        <Grid container={true} item={true} spacing={2}>
                            <Grid item={true} xs={5}>
                                <VariableTypeInput {...variableTypeConfig} />
                            </Grid>
                            <Grid item={true} xs={7}>
                                <FormTextInput
                                    dataTestId="api-extract-segment"
                                    disabled={disabled}
                                    defaultValue={segmentState?.name}
                                    customProps={{ validate: validatePayloadNameValue }}
                                    onChange={onChangeSegmentName}
                                    errorMessage={payloadVarNameError}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </div>
        )
    );
}
