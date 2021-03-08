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

// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import React, { ReactNode, useEffect, useState } from 'react';

import { FormHelperText } from '@material-ui/core';
import { AddRounded, CloseRounded } from '@material-ui/icons';
import classNames from 'classnames';

import { ButtonWithIcon } from '../../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { IconBtnWithText } from '../../../../../Portals/ConfigForm/Elements/Button/IconBtnWithText';
import { FormTextInput } from '../../../../../Portals/ConfigForm/Elements/TextField/FormTextInput';
import { useStyles as useFormStyles } from "../../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, ProcessConfig } from '../../../../../Portals/ConfigForm/types';

interface ParameterSelectorProps {
    processConfig: ProcessConfig;
}

export function ParameterSelector(props: ParameterSelectorProps) {
    const formClasses = useFormStyles();
    const { processConfig } = props;
    const config: DataMapperConfig = processConfig.config as DataMapperConfig;

    const [parameterList, updateParameterList] = useState(config.parameters);
    const [parameterName, setParameterName] = useState('');
    const [parameterType, setParameterType] = useState('');


    const handleChangeVariableName = (value: string) => {
        setParameterName(value)
    }

    const handleChangeVariableType = (value: string) => {
        setParameterType(value);
    }

    const onParameterAddClick = () => {
        updateParameterList([
            ...parameterList,
            {name: parameterName, type: parameterType}
        ]);
        (processConfig.config as DataMapperConfig).parameters = parameterList;

        setParameterName('');
        setParameterType('');
    }


    const parameterElements: ReactNode[] = [];

    parameterList.forEach((element, index) => {
        const getDelete = () => {
            // return () => deleteItem(index);
        };
        parameterElements.push(
            <div key={index} className={formClasses.headerWrapper}>
                <div className={formClasses.headerLabel}>
                    {`${element.name} : ${element.type}`}

                    <ButtonWithIcon
                        className={formClasses.deleteBtn}
                        onClick={() => { }}
                        icon={<CloseRounded fontSize="small" />}
                    />
                </div>
            </div>
        )
    });

    return (
        <div>
            <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                <FormTextInput
                    dataTestId="variable-name"
                    label={"Name"}
                    onChange={handleChangeVariableName}
                    defaultValue={parameterName}
                    placeholder={"Enter Variable Name"}
                />
                <FormTextInput
                    dataTestId="variable-type"
                    label={"Type"}
                    onChange={handleChangeVariableType}
                    defaultValue={parameterType}
                    placeholder={"Enter Variable Type"}
                />
                <IconBtnWithText
                    onClick={onParameterAddClick}
                    text="Add Parameter"
                    icon={<AddRounded fontSize="small" className={formClasses.iconButton} />}
                    disabled={false}
                />
            </div>
            {
                parameterElements.length > 0 &&
                <>
                    <FormHelperText className={formClasses.inputLabelForRequired}>Parameters :</FormHelperText>
                    <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                        {parameterElements}
                    </div>
                </>
            }

        </div>
    )
}
