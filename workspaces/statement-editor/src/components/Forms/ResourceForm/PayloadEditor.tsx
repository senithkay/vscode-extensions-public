/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from 'react';

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { connectorStyles, TextPreloaderVertical } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../models/definitions';

import { ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParameterConfig, ParamItem } from './ParamEditor/ParamItem';
import { RESOURCE_PAYLOAD_PREFIX } from './ResourceParamEditor';
import { ResourceParam } from './types';
import { getParamString } from './util';

export interface PayloadEditorProps {
    parameters: ResourceParam[];
    readonly?: boolean;
    syntaxDiag?: StatementSyntaxDiagnostics[];
    completions?: SuggestionItem[]
    onChange: (payloadString: string) => void;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export function PayloadEditor(props: PayloadEditorProps) {
    const { parameters, syntaxDiag, readonly, completions, onChange, onChangeInProgress } = props;

    const connectorClasses = connectorStyles();
    const [paramIndex, setParamIndex] = useState(-1);
    const [addingParam, setAddingParam] = useState(false);

    const [paramConfig, setParamConfig] = useState<ParameterConfig>({ id: -1, name: '' });
    const [payloadParam, setPayloadParam] = useState<ResourceParam>();

    useEffect(() => {
        const payloadEntry = parameters.findIndex((param) => param.parameterValue.includes(RESOURCE_PAYLOAD_PREFIX));
        if (payloadEntry > -1) {
            const config: ParameterConfig = { id: -1, name: '' }
            config.id = payloadEntry;
            config.name = parameters[payloadEntry].name;
            config.type = parameters[payloadEntry].type;
            config.option = PARAM_TYPES.PAYLOAD;
            config.defaultValue = parameters[payloadEntry].default;
            setParamConfig(config);
            setPayloadParam(parameters[payloadEntry])
        }

        setParamIndex(payloadEntry);
    }, [parameters]);

    const onParamChange = (segmentId: number, paramString: string, paramModel?: STNode) => {
        const newParamString: string = parameters.reduce((prev, current, currentIndex) => {
            if (currentIndex === segmentId) {
                return prev !== "" ? `${prev},${paramString}` : `${paramString}`;
            }

            return prev !== "" ? `${prev},${current.parameterValue}` : `${current.parameterValue}`;
        }, '');
        onChange(newParamString);
    };

    const addParam = () => {
        let newParamString;
        const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param.model) || STKindChecker.isDefaultableParam(param.model));
        if (lastParamIndex === -1) {
            newParamString = `${getParamString(parameters)}${parameters.length === 0 ? '' : ','} ${RESOURCE_PAYLOAD_PREFIX} string payload`;
        } else {
            newParamString = parameters.reduce((prev, current, currentIndex) => {
                let returnString = prev;
                if (currentIndex === lastParamIndex) {
                    returnString = returnString !== "" ? `${returnString},${RESOURCE_PAYLOAD_PREFIX} string payload` : `${RESOURCE_PAYLOAD_PREFIX} string payload`;
                }

                returnString = returnString !== "" ? `${returnString},${current.parameterValue}` : `${current.parameterValue}`;
                return returnString;
            }, '');
        }
        onChange(newParamString);
        setAddingParam(true);
        onChangeInProgress(true);
    };

    const onDelete = (param: ParameterConfig) => {
        parameters.splice(param.id, 1)
        setParamIndex(-1);
        setAddingParam(false);
        onChange(getParamString(parameters));
    };

    const onEdit = () => {
        setAddingParam(true);
        onChangeInProgress(true);
    };

    const onEditorCancel = () => {
        setAddingParam(false);
        onChangeInProgress(false);
    };

    return (
        <div>
            {paramIndex === -1 && (
                <div>
                    <Button
                        data-test-id="payload-add-button"
                        onClick={addParam}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        disabled={readonly}
                    >
                        Add Payload
                    </Button>
                </div>
            )}
            {paramIndex > -1 && addingParam && (
                <ParamEditor
                    segmentId={paramIndex}
                    syntaxDiagnostics={syntaxDiag}
                    model={payloadParam}
                    completions={completions}
                    isEdit={true}
                    optionList={[PARAM_TYPES.PAYLOAD]}
                    option={PARAM_TYPES.PAYLOAD}
                    isTypeReadOnly={false}
                    onChange={onParamChange}
                    onCancel={onEditorCancel}
                />
            )}
            {paramIndex > -1 && !addingParam && (
                <ParamItem
                    param={paramConfig}
                    readonly={readonly}
                    onDelete={onDelete}
                    onEditClick={onEdit}
                />
            )}
            {(paramIndex === -1) && addingParam && (
                <div>
                    <TextPreloaderVertical position="fixedMargin" />
                </div>
            )}
        </div>
    );
}
