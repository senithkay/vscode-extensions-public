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
import {
    dynamicConnectorStyles as connectorStyles,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { CommaToken, DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../models/definitions';

import { ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParamItem } from './ParamEditor/ParamItem';
import { RESOURCE_CALLER_TYPE, RESOURCE_HEADER_MAP_TYPE, RESOURCE_REQUEST_TYPE } from './ResourceParamEditor';
import { useStyles } from "./styles";
import { genParamName, getParameterNameFromModel, getParameterType, getParameterTypeFromModel, getParamString } from './util';

export interface PayloadEditorProps {
    // requestName: string;
    // headersName: string;
    // callerName: string;
    // requestSemDiag?: string;
    // callerSemDiag?: string;
    // headersSemDiag?: string;
    parameters: (CommaToken | DefaultableParam | RequiredParam | IncludedRecordParam | RestParam)[];
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    completions?: SuggestionItem[]
    onChange: (paramString: string) => void;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export function AdvancedParamEditor(props: PayloadEditorProps) {
    const {
        parameters, readonly,
        syntaxDiag, onChange, onChangeInProgress,
        completions
    } = props;

    const classes = useStyles();
    const connectorClasses = connectorStyles();
    const [advancedOptionsShown, setAdvancedOptionsShown] = useState(false);
    const [requestIndex, setRequestIndex] = useState(-1);
    const [callerIndex, setCallerIndex] = useState(-1);
    const [headerIndex, setHeaderIndex] = useState(-1);
    const [currentEditOption, setCurrentEditOption] = useState<PARAM_TYPES>(undefined);

    useEffect(() => {
        let foundRequestIndex = -1;
        let foundCallerIndex = -1;
        let foundHeaderIndex = -1;

        parameters
            .forEach((param, index) => {
                if (param.source && param.source.includes(RESOURCE_CALLER_TYPE)) {
                    foundCallerIndex = index;
                }

                if (param.source && param.source.includes(RESOURCE_HEADER_MAP_TYPE)) {
                    foundHeaderIndex = index;
                }

                if (param.source && param.source.includes(RESOURCE_REQUEST_TYPE)) {
                    foundRequestIndex = index;
                }
            });

        setAdvancedOptionsShown(foundRequestIndex > -1 || foundCallerIndex > -1 || foundHeaderIndex > -1);
        setRequestIndex(foundRequestIndex);
        setCallerIndex(foundCallerIndex);
        setHeaderIndex(foundHeaderIndex);
    }, [parameters]);

    const onShowAdvancedOptionsClick = () => {
        setAdvancedOptionsShown(!advancedOptionsShown);
    };

    const showButton = (value: PARAM_TYPES) => {
        const handleAddParameter = () => {
            let newParamString;
            let type = '';

            switch (value) {
                case PARAM_TYPES.CALLER:
                    type = RESOURCE_CALLER_TYPE;
                    break;
                case PARAM_TYPES.REQUEST:
                    type = RESOURCE_REQUEST_TYPE;
                    break;
                case PARAM_TYPES.HEADER_MAP:
                    type = RESOURCE_HEADER_MAP_TYPE;
            }

            const parameterNames = parameters.map(param => !STKindChecker.isCommaToken(param) && param.paramName?.value);
            let segmentId = parameters.length + 1;
            const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param) || STKindChecker.isDefaultableParam(param));
            if (lastParamIndex === -1) {
                newParamString = `${type} ${genParamName('param', parameterNames)}`;
            } else {
                segmentId = lastParamIndex;
                newParamString = parameters.reduce((prev, current, currentIndex) => {
                    let returnString = prev;
                    if (currentIndex === lastParamIndex) {
                        returnString = `${type} ${genParamName('param', parameterNames)},`
                    }

                    returnString = `${returnString}${current.source ? current.source : current.value}`
                    return returnString;
                }, '');
            }

            onChange(newParamString);
            setCurrentEditOption(value);
        };

        return (
            <Button
                data-test-id={`${value}-add-button`}
                onClick={handleAddParameter}
                className={connectorClasses.addParameterBtn}
                startIcon={<AddIcon />}
                color="primary"
                disabled={false}
            >
                {`Add ${value}`}
            </Button>
        )
    };

    const getParamEditorComponent = (paramIndex: number, type: PARAM_TYPES, activeType: PARAM_TYPES) => {
        const handleOnParamChange = (segmentId: number, paramString: string, paramModel?: STNode) => {
            const newParamString = parameters.reduce((prev, current, currentIndex) => {
                if (segmentId === currentIndex) {
                    return `${prev} ${paramString}`;
                }

                return `${prev}${current.source ? current.source : current.value}`;
            }, '');

            onChange(newParamString);
        }

        const handleCancelEditParam = () => {
            setCurrentEditOption(undefined);
        }

        const handleParamDelete = () => {
            parameters.splice(paramIndex === 0 ? paramIndex : paramIndex - 1, 2)
            onChange(getParamString(parameters));
        }

        const handleParamEditClick = () => {
            setCurrentEditOption(type);
        }

        return (
            <>
                {
                    type === activeType ? (
                        <ParamEditor
                            segmentId={paramIndex}
                            syntaxDiagnostics={syntaxDiag}
                            model={(parameters[paramIndex] as DefaultableParam | RequiredParam | IncludedRecordParam | RestParam)}
                            completions={completions}
                            isEdit={true}
                            optionList={[type]}
                            option={type}
                            onChange={handleOnParamChange}
                            onCancel={handleCancelEditParam}
                        />
                    ) : (
                        <ParamItem
                            param={{
                                id: paramIndex,
                                name: getParameterNameFromModel(parameters[paramIndex]),
                                type: getParameterTypeFromModel(parameters[paramIndex]),
                                option: type
                            }}
                            readonly={false}
                            onDelete={handleParamDelete}
                            onEditClick={handleParamEditClick}
                        />
                    )

                }
            </>

        );
    };

    return (
        <div>
            <div className={classes.advancedParamWrapper}>
                <div className={classes.advancedParamHeader}>Advanced Parameters </div>
                <Button className={classes.advancedParamBtn} onClick={onShowAdvancedOptionsClick}>
                    {advancedOptionsShown ? "Hide" : "Show"}
                </Button>
            </div>
            {advancedOptionsShown && (
                <>
                    <div>
                        {requestIndex === -1 && showButton(PARAM_TYPES.REQUEST)}
                        {requestIndex > -1 && getParamEditorComponent(requestIndex, PARAM_TYPES.REQUEST, currentEditOption)}
                    </div>
                    <div>
                        {callerIndex === -1 && showButton(PARAM_TYPES.CALLER)}
                        {callerIndex > -1 && getParamEditorComponent(callerIndex, PARAM_TYPES.CALLER, currentEditOption)}
                    </div>
                    <div>
                        {headerIndex === -1 && showButton(PARAM_TYPES.HEADER_MAP)}
                        {headerIndex > -1 && getParamEditorComponent(headerIndex, PARAM_TYPES.HEADER_MAP, currentEditOption)}
                    </div>
                </>
            )}
        </div>
    );
}
