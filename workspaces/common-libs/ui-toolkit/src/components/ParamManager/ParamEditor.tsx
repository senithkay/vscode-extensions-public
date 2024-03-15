/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React from 'react';

import { ActionButtons } from '../ActionButtons/ActionButtons';
import { EditorContainer, EditorContent } from './styles';
import { Param, TypeResolver } from './TypeResolver';
import { Parameters } from './ParamManager';

export interface ParamProps {
    parameters: Parameters;
    isTypeReadOnly?: boolean;
    onChange: (param: Parameters) => void;
    onSave?: (param: Parameters) => void;
    onCancel?: (param?: Parameters) => void;
}

export function ParamEditor(props: ParamProps) {
    const { parameters, onChange, onSave, onCancel } = props;

    const getParamComponent = (p: Param) => {
        const handleTypeResolverChange = (newParam: Param) => {
            // update the params array base on the id of the param with the new param
            const updatedParams = parameters.parameters.map(param => {
                if (param.id === newParam.id) {
                    return newParam;
                }
                return param;
            });

            const paramEnabled = updatedParams.map(param => {
                if (param.enableCondition === null || param.enableCondition) {
                    const enableCondition = param.enableCondition;
                    let paramEnabled = false;
                    enableCondition["OR"]?.forEach(item => {
                        updatedParams.forEach(par => {
                            if (item[`${par.label}`]) {
                                const satisfiedConditionValue = item[`${par.label}`];
                                // if one of the condition is satisfied, then the param is enabled
                                if (par.value === satisfiedConditionValue) {
                                    paramEnabled = true;
                                }
                                
                            }
                        });
                    });
                    enableCondition["AND"]?.forEach(item => {
                        paramEnabled = !paramEnabled ? false : paramEnabled; 
                        for (const par of updatedParams) {
                            if (item[`${par.label}`]) {
                                const satisfiedConditionValue = item[`${par.label}`];
                                // if all of the condition is not satisfied, then the param is enabled
                                paramEnabled = (par.value === satisfiedConditionValue);
                                if (!paramEnabled) {
                                    break;
                                }
                            }
                        }
                    });
                    enableCondition["NOT"]?.forEach(item => {
                        for (const par of updatedParams) {
                            if (item[`${par.label}`]) {
                                const satisfiedConditionValue = item[`${par.label}`];
                                // if the condition is not satisfied, then the param is enabled
                                paramEnabled = !(par.value === satisfiedConditionValue);
                                if (!paramEnabled) {
                                    break;
                                }
                            }
                        }
                    });
                    enableCondition["null"]?.forEach(item => {
                        updatedParams.forEach(par => {
                            if (item[`${par.label}`]) {
                                const satisfiedConditionValue = item[`${par.label}`];
                                // if the condition is not satisfied, then the param is enabled
                                paramEnabled = (par.value === satisfiedConditionValue);
                            }
                        });
                    });
                    return {...param, isEnabled: paramEnabled};
                }
                return param;
            });
            onChange({ ...parameters, parameters: paramEnabled });
        }
        return <TypeResolver param={p} onChange={handleTypeResolverChange} />;
    }

    const handleOnCancel = () => {
        onCancel(parameters);
    };

    const handleOnSave = () => {
        onSave(parameters);
    };

    return (
        <EditorContainer>
            <EditorContent>
                {parameters?.parameters.map(param => getParamComponent(param))}
            </EditorContent>
            <ActionButtons
                primaryButton={{ text: "Save", onClick: handleOnSave }}
                secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                sx={{ justifyContent: "flex-end" }}
            />
        </EditorContainer >
    );
}
