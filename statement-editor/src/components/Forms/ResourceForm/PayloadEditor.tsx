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
import { connectorStyles } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { CommaToken, DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../models/definitions';

import { ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParameterConfig, ParamItem } from './ParamEditor/ParamItem';
import { RESOURCE_PAYLOAD_PREFIX } from './ResourceParamEditor';
import { genParamName, getParamString } from './util';

export interface PayloadEditorProps {
    parameters: (CommaToken | DefaultableParam | RequiredParam | IncludedRecordParam | RestParam)[];
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

    useEffect(() => {
        const payloadEntry = parameters.findIndex((param) =>
            !STKindChecker.isCommaToken(param) && param.source.includes(RESOURCE_PAYLOAD_PREFIX));

        setParamIndex(payloadEntry);
    }, [parameters]);

    const onParamChange = (segmentId: number, paramString: string, paramModel?: STNode) => {
        const newParamString: string = parameters.reduce((prev, current, currentIndex) => {
            if (currentIndex === segmentId) {
                return `${prev} ${paramString}`;
            }

            return `${prev}${current.value ? current.value : current.source}`;
        }, '');
        onChange(newParamString);
    };

    const addParam = () => {
        let newParamString;
        const parameterNames = parameters.map(param => !STKindChecker.isCommaToken(param) && param.paramName?.value);
        const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param) || STKindChecker.isDefaultableParam(param));
        if (lastParamIndex === -1) {
            newParamString = `${getParamString(parameters)}${parameters.length === 0 ? '' : ','} ${RESOURCE_PAYLOAD_PREFIX} string ${genParamName('param', parameterNames)}`;
        } else {
            newParamString = parameters.reduce((prev, current, currentIndex) => {
                let returnString = prev;
                if (currentIndex === lastParamIndex) {
                    returnString = `${returnString} ${RESOURCE_PAYLOAD_PREFIX} string ${genParamName('param', parameterNames)},`
                }

                returnString = `${returnString}${current.source ? current.source : current.value}`
                return returnString;
            }, '');
        }
        console.log('>>> payload string', newParamString);
        onChange(newParamString);
        // onChange(`${RESOURCE_PAYLOAD_PREFIX} json ${genParamName('param', parameterNames)}`);
        setAddingParam(true);
        onChangeInProgress(true);
    };
    const onDelete = (param: ParameterConfig) => {
        parameters.splice(param.id === 0 ? param.id : param.id - 1, 2)
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

    const paramConfig: ParameterConfig = {
        id: -1,
        name: ''
    };

    if (paramIndex > -1) {
        paramConfig.id = paramIndex;
        paramConfig.name = (parameters[paramIndex] as DefaultableParam | RequiredParam
            | IncludedRecordParam).paramName.value;
        paramConfig.type = (parameters[paramIndex] as DefaultableParam | RequiredParam
            | IncludedRecordParam).typeName.source;
        paramConfig.option = PARAM_TYPES.PAYLOAD;
        paramConfig.defaultValue = STKindChecker.isDefaultableParam(parameters[paramIndex]) ?
            (parameters[paramIndex] as DefaultableParam).expression.source
            : '';
    }

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
                        disabled={false}
                    >
                        Add Payload
                    </Button>
                </div>
            )}
            {paramIndex > -1 && addingParam && (
                <ParamEditor
                    segmentId={paramIndex}
                    syntaxDiagnostics={syntaxDiag}
                    model={parameters[paramIndex] as DefaultableParam | RequiredParam | IncludedRecordParam}
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
        </div>
    );
}
