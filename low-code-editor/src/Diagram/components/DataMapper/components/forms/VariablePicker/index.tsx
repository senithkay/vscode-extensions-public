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
// tslint:disable: jsx-no-lambda
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from 'react';

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from '@ballerina/syntax-tree';
import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';
import classNames from 'classnames';

import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { wizardStyles } from "../../../../ConfigForms/style";
import { FormAutocomplete } from '../../../../Portals/ConfigForm/Elements/Autocomplete';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperInputTypeInfo } from '../../../../Portals/ConfigForm/types';
import { Context as DataMapperViewContext } from '../../../context/DataMapperViewContext';

export function VariablePicker() {
    const { updateDataMapperConfig } = useContext(DiagramContext);
    const {
        state: {
            stSymbolInfo,
            dataMapperConfig,
            maxFieldWidth,
            outputSTNode
        },
        toggleAddVariableForm: toggleVariablePicker,
        dataMapperViewRedraw
    } = useContext(DataMapperViewContext);

    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();

    const selectedVariables = dataMapperConfig ? dataMapperConfig.inputTypes.map((input: any) => input.name) : [];
    const variables: DataMapperInputTypeInfo[] = [];

    const onSelectVariable = (evt: any, typeEntry: DataMapperInputTypeInfo) => {
        dataMapperConfig.inputTypes.push(typeEntry);
    };

    const onClickAdd = () => {
        updateDataMapperConfig(dataMapperConfig);
        toggleVariablePicker();
    }

    const handleCancelBtnClick = () => {
        toggleVariablePicker();
        dataMapperViewRedraw(outputSTNode);
    }

    stSymbolInfo.variables.forEach((definedVars: STNode[], type: string) => {
        definedVars
            .filter((el: STNode) => {
                let varName: string;

                if (STKindChecker.isLocalVarDecl(el)) {
                    varName = (el.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
                } else if (STKindChecker.isRequiredParam(el)) {
                    varName = el.paramName.value;
                }

                return selectedVariables.indexOf(varName) === -1;
            })
            .forEach((el: STNode) => {
                if (STKindChecker.isLocalVarDecl(el)) {
                    variables.push({
                        name: (el.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value,
                        type,
                        node: el
                    })
                } else if (STKindChecker.isRequiredParam(el)) {
                    variables.push({
                        name: el.paramName.value,
                        type,
                        node: el
                    })
                }
            });
    });

    return (
        <>
            <div style={{ width: maxFieldWidth + 5 }}>
                <FormAutocomplete
                    dataTestId={'datamapper-input-var-select'}
                    itemList={variables}
                    onChange={onSelectVariable}
                    label={'Select Input type'}
                    getItemLabel={(option) => option.name}
                    renderItem={(option) => (
                        <React.Fragment>
                            {option.name} {option.type}
                        </React.Fragment>
                    )}
                />
                <div className={overlayClasses.buttonWrapper} style={{ paddingTop: '0.5rem' }}>
                    <SecondaryButton
                        dataTestId={"datamapper-input-var-cancel-btn"}
                        text="Cancel"
                        fullWidth={false}
                        onClick={handleCancelBtnClick}
                    />
                    <PrimaryButton
                        disabled={false}
                        dataTestId={"datamapper-input-var-save-btn"}
                        text={"Add"}
                        fullWidth={false}
                        onClick={onClickAdd}
                    />
                </div>
            </div>
        </>
    );
}
