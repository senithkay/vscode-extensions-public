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
import React, { useMemo } from "react";

import { ParamEditButton } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { CheckBoxGroup } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LetVarDecl, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { LetVarDeclModel } from "./LocalVarConfigPanel";
import { useStyles } from "./style";

interface LetVarDeclItemProps {
    letVarDeclModel: LetVarDeclModel
    handleOnCheck: () => void;
    onEditClick: (letVarDecl: LetVarDecl) => void;
}

export function LetVarDeclItem(props: LetVarDeclItemProps) {
    const { letVarDeclModel, handleOnCheck, onEditClick } = props;
    const overlayClasses = useStyles();

    const handleCheckboxClick = (list: string[]) => {
        letVarDeclModel.checked = list.length > 0;
        handleOnCheck();
    };

    const handleEdit = () => {
        onEditClick(letVarDeclModel.letVarDecl);
    };

    const [type, varName] = useMemo(() => {
        const pattern = letVarDeclModel.letVarDecl.typedBindingPattern;
        if (STKindChecker.isCaptureBindingPattern(pattern.bindingPattern)) {
            return [pattern.typeDescriptor.source.trim(), pattern.bindingPattern.variableName.value];
        }
        return [undefined, undefined];
    }, [letVarDeclModel])

    return (
        <div className={overlayClasses.headerWrapper} data-testid={`${varName}-item`}>
            <div className={overlayClasses.contentSection} >
                <CheckBoxGroup
                    values={[`${type} ${varName}`]}
                    defaultValues={letVarDeclModel.checked ? [`${type} ${varName}`] : []}
                    onChange={handleCheckboxClick}
                />
            </div>
            <div className={overlayClasses.iconSection}>
                <div className={overlayClasses.editIconWrapper}>
                    <ParamEditButton onClick={handleEdit} />
                </div>
            </div>
        </div>
    );
}
