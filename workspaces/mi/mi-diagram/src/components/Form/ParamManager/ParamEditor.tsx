/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { Param, TypeResolver } from './TypeResolver';
import { ParamField, Parameters, isFieldEnabled, getParamFieldLabelFromParamId } from './ParamManager';
import { ActionButtons, Drawer } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';

export interface ParamProps {
    parameters: Parameters;
    paramFields: ParamField[];
    isTypeReadOnly?: boolean;
    openInDrawer?: boolean;
    onChange: (param: Parameters) => void;
    onSave?: (param: Parameters) => void;
    onCancel?: (param?: Parameters) => void;
}

const EditorContainer = styled.div`
    display: flex;
    margin: 10px 0;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid var(--vscode-dropdown-border);
`;

const EditorContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px 0;
`;

const DrawerContent = styled.div`
    padding: 16px;
    width: 390px;
`;

export function ParamEditor(props: ParamProps) {
    const { parameters, paramFields, openInDrawer, onChange, onSave, onCancel } = props;
    const [isDrawerCancelInProgress, setIsDrawerCancelInProgress] = useState(false);

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
                    const paramEnabled = isFieldEnabled(updatedParams, enableCondition);
                    return {...param, isEnabled: paramEnabled};
                }
                return param;
            });
            onChange({ ...parameters, parameters: paramEnabled });
        }
        return <TypeResolver param={p} onChange={handleTypeResolverChange} />;
    }

    const handleOnCancel = () => {
        if (openInDrawer) {
            setIsDrawerCancelInProgress(true);
            // 500ms delay to allow the drawer to close before calling the onCancel callback
            setTimeout(() => {
                onCancel(parameters);
                setIsDrawerCancelInProgress(false);
            }, 500);
        } else {
            onCancel(parameters);
        }
    };

    const handleOnSave = () => {
        onSave(parameters);
    };

    return (
        <>
            {!openInDrawer && (
                <EditorContainer>
                    <EditorContent>
                        {parameters?.parameters.map(param => getParamComponent({ ...param, label: getParamFieldLabelFromParamId(paramFields, param.id) }))}
                    </EditorContent>
                    <ActionButtons
                        primaryButton={{ text: "Save", onClick: handleOnSave }}
                        secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                        sx={{ justifyContent: "flex-end" }}
                    />
                </EditorContainer>
            )}
            <Drawer isOpen={isDrawerCancelInProgress ? false : openInDrawer} id="drawer1" isSelected={true}>
                {openInDrawer && (
                    <DrawerContent>
                        {parameters?.parameters.map(param => getParamComponent({
                                ...param,
                                label: getParamFieldLabelFromParamId(paramFields, param.id)
                            })
                        )}
                        <ActionButtons
                            primaryButton={{ text: "Save", onClick: handleOnSave }}
                            secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                            sx={{ justifyContent: "flex-end" }}
                        />
                    </DrawerContent>
                )}
            </Drawer>
        </>
    );
}
