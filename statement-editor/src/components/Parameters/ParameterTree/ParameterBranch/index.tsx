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
import React, { useState } from "react";

import { Button, List, ListItem } from "@material-ui/core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { TypeProps } from "..";
import { useStmtEditorHelperPanelStyles } from "../../../styles";
import { isRequiredParam } from "../utils";

import * as Types from "./../Types";

export interface ParameterBranchProps {
    parameters: FormField[];
    depth: number;
    onChange: () => void;
}

export function ParameterBranch(props: ParameterBranchProps) {
    const { parameters, depth, onChange } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();

    const [showOptionalParams, setShowOptionalParams] = useState(false);

    const requiredParams: JSX.Element[] = [];
    const optionalParams: JSX.Element[] = [];

    parameters?.forEach((param: FormField, index: number) => {
        let TypeComponent = (Types as any)[param.typeName];
        const typeProps: TypeProps = {
            param,
            depth,
            onChange
        };
        if (!TypeComponent) {
            TypeComponent = (Types as any).custom;
        }
        if (isRequiredParam(param)) {
            requiredParams.push(<TypeComponent key={index} {...typeProps} />);
        } else {
            optionalParams.push(<TypeComponent key={index} {...typeProps} />);
        }
    });

    function toggleOptionalParams(e: any) {
        setShowOptionalParams(!showOptionalParams);
    }

    return (
        <List>
            {requiredParams}
            {optionalParams.length > 0 && (
                <ListItem className={stmtEditorHelperClasses.listOptionalWrapper}>
                    <div className={stmtEditorHelperClasses.listOptionalHeader}>Optional fields </div>
                    <Button className={stmtEditorHelperClasses.listOptionalBtn} onClick={toggleOptionalParams}>
                        {showOptionalParams ? "Hide" : "Show"}
                    </Button>
                </ListItem>
            )}
            {showOptionalParams && (optionalParams.length > 0) && optionalParams}
        </List>
    );
}
