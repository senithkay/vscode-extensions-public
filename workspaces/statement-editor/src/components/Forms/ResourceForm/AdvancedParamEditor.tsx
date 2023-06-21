/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useEffect, useState } from 'react';

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import {
    dynamicConnectorStyles as connectorStyles, TextPreloaderVertical,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from '../../../models/definitions';

import { ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParamItem } from './ParamEditor/ParamItem';
import { RESOURCE_CALLER_TYPE, RESOURCE_HEADER_MAP_TYPE, RESOURCE_REQUEST_TYPE } from './ResourceParamEditor';
import { useStyles } from "./styles";
import { ResourceParam } from './types';
import { genParamName, getParamString } from './util';

export interface PayloadEditorProps {
    parameters: ResourceParam[];
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    completions?: SuggestionItem[]
    onChange: (paramString: string) => void;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export function AdvancedParamEditor(props: PayloadEditorProps) {
    const {
        parameters, readonly,
        onChange, onChangeInProgress,
        completions
    } = props;

    const classes = useStyles();
    const connectorClasses = connectorStyles();
    const [advancedOptionsShown, setAdvancedOptionsShown] = useState(false);
    const [requestIndex, setRequestIndex] = useState(-1);
    const [callerIndex, setCallerIndex] = useState(-1);
    const [headerIndex, setHeaderIndex] = useState(-1);
    const [currentEditOption, setCurrentEditOption] = useState<PARAM_TYPES>(undefined);
    const [isNew, setIsNew] = useState(false);

    const paramNames: string[] = parameters.map(param => param.name);

    useEffect(() => {
        let foundRequestIndex = -1;
        let foundCallerIndex = -1;
        let foundHeaderIndex = -1;

        parameters
            .forEach((param, index) => {
                if (param.parameterValue && param.parameterValue.includes(RESOURCE_CALLER_TYPE)) {
                    foundCallerIndex = index;
                }

                if (param.parameterValue && param.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)) {
                    foundHeaderIndex = index;
                }

                if (param.parameterValue && param.parameterValue.includes(RESOURCE_REQUEST_TYPE)) {
                    foundRequestIndex = index;
                }
            });

        setAdvancedOptionsShown(advancedOptionsShown ||
            (foundRequestIndex > -1 || foundCallerIndex > -1 || foundHeaderIndex > -1));
        setRequestIndex(foundRequestIndex);
        setCallerIndex(foundCallerIndex);
        setHeaderIndex(foundHeaderIndex);
    }, [parameters]);

    const onShowAdvancedOptionsClick = () => {
        setAdvancedOptionsShown(!advancedOptionsShown);
    };

    const showButton = (value: PARAM_TYPES) => {
        const handleAddParameter = () => {
            setIsNew(true);
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

            let segmentId = parameters.length === 0 ? 0 : parameters.length;
            const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param.model) || STKindChecker.isDefaultableParam(param.model));

            if (lastParamIndex > -1) {
                segmentId = lastParamIndex;
            }

            const paramName = genParamName('param', paramNames);
            const newObject: ResourceParam = { parameterValue: `${type} ${paramName}`, diagnosticMsg: [], name: paramName, type, default: "" };

            // Insert the object at the specified index
            parameters.splice(segmentId, 0, newObject);
            onChange(getParamString(parameters));
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
                    return prev !== "" ? `${prev},${paramString}` : `${paramString}`;
                }
                return prev !== "" ? `${prev},${current.parameterValue}` : `${current.parameterValue}`;
            }, '');
            onChange(newParamString);
        }

        const handleCancelEditParam = (id?: number) => {
            setCurrentEditOption(undefined);
            onChangeInProgress(false);
            if (id !== undefined && id >= 0 && isNew) {
                paramIndex = id;
                handleParamDelete();
            }
            setIsNew(false);
        }

        const handleParamDelete = () => {
            const updatedParameters = [...parameters]; // Create a new array to avoid mutating the original array
            const indexToRemove = paramIndex;
            if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
                updatedParameters.splice(indexToRemove, 1); // Remove the element at the specified index
                onChange(getParamString(updatedParameters));
            }
            switch (type) {
                case PARAM_TYPES.CALLER:
                    setCallerIndex(-1);
                    break;
                case PARAM_TYPES.HEADER:
                    setHeaderIndex(-1);
                    break;
                case PARAM_TYPES.REQUEST:
                    setRequestIndex(-1);
                    break;
                default:
                // not required
            }
        }

        const handleParamEditClick = () => {
            setCurrentEditOption(type);
            onChangeInProgress(true);
        }

        return (
            <>
                {
                    type === activeType ? (
                        <ParamEditor
                            segmentId={paramIndex}
                            syntaxDiagnostics={[]}
                            model={parameters[paramIndex]}
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
                                name: parameters[paramIndex]?.name,
                                type: parameters[paramIndex]?.type,
                                option: type
                            }}
                            readonly={readonly}
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
                <Button className={classes.advancedParamBtn} onClick={onShowAdvancedOptionsClick} disabled={readonly}>
                    {advancedOptionsShown ? "Hide" : "Show"}
                </Button>
            </div>
            {advancedOptionsShown && (
                <>
                    <div>
                        {requestIndex === -1 && showButton(PARAM_TYPES.REQUEST)}
                        {requestIndex > -1 && getParamEditorComponent(requestIndex, PARAM_TYPES.REQUEST, currentEditOption)}
                        {(requestIndex !== -1) && !getParamEditorComponent(requestIndex, PARAM_TYPES.REQUEST, currentEditOption) && (
                            <div>
                                <TextPreloaderVertical position="fixedMargin" />
                            </div>
                        )}
                    </div>
                    <div>
                        {callerIndex === -1 && showButton(PARAM_TYPES.CALLER)}
                        {callerIndex > -1 && getParamEditorComponent(callerIndex, PARAM_TYPES.CALLER, currentEditOption)}
                        {(callerIndex !== -1) && !getParamEditorComponent(callerIndex, PARAM_TYPES.CALLER, currentEditOption) && (
                            <div>
                                <TextPreloaderVertical position="fixedMargin" />
                            </div>
                        )}
                    </div>
                    <div>
                        {headerIndex === -1 && showButton(PARAM_TYPES.HEADER_MAP)}
                        {headerIndex > -1 && getParamEditorComponent(headerIndex, PARAM_TYPES.HEADER_MAP, currentEditOption)}
                        {(headerIndex !== -1) && !getParamEditorComponent(headerIndex, PARAM_TYPES.HEADER_MAP, currentEditOption) && (
                            <div>
                                <TextPreloaderVertical position="fixedMargin" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
