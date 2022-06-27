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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useRef, useState } from "react";
import { useIntl } from "react-intl";

// import { Box, FormControl } from "@material-ui/core";
import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from "../../../../../../Contexts/Diagram";
// import { TextPreLoader } from "../../../../../../PreLoader/TextPreLoader";
import {
    createCheckObjectDeclaration,
    createObjectDeclaration,
    getAllVariables,
    getInitialSource,
} from "../../../../../utils";
import { genVariableName, getFormattedModuleName } from "../../../../Portals/utils";
import { FormGeneratorProps } from "../../../FormGenerator";
// import { wizardStyles as useFormStyles } from "../../style";
// import useStyles from "../style";
import { getDefaultParams, getFormFieldReturnType } from "../util";

// enum PackagePullStatus {
//     NOT_PULLED = "not pulled",
//     SUCCESS = "success",
//     EXIST = "exist",
//     FAILED = "failed",
// }
interface EndpointFormProps {
    connector: BallerinaConnectorInfo;
}

export function EndpointForm(props: FormGeneratorProps) {
    const intl = useIntl();
    // const classes = useStyles();
    // const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, formArgs } = configOverlayFormStatus;
    const { connector } = formArgs as EndpointFormProps;

    const {
        props: { currentFile, stSymbolInfo, syntaxTree, experimentalEnabled },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library,
            runCommandInBackground,
        },
    } = useContext(Context);

    // const packagePullStatus = useRef<PackagePullStatus>(model ? PackagePullStatus.EXIST : PackagePullStatus.NOT_PULLED);
    // const [isPullingModule, setIsPullingModule] = useState(false);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.endpointForm.title",
        defaultMessage: "Endpoint",
    });

    const imports = new Set<string>([`${connector.package.organization}/${connector.moduleName}`]);
    const moduleName = getFormattedModuleName(connector.moduleName);
    let initialSource = "EXPRESSION";

    if (model && model.source) {
        // Update existing endpoint
        initialSource = model.source;
    } else {
        // Adding new endpoint
        const initFunction = (connector as BallerinaConnectorInfo).functions?.find((func) => func.name === "init");
        if (initFunction) {
            const defaultParameters = getDefaultParams(initFunction.parameters);
            const returnType = getFormFieldReturnType(initFunction.returnType);

            initialSource = getInitialSource(
                returnType?.hasError
                    ? createCheckObjectDeclaration(
                          `${moduleName}:${connector.name}`,
                          genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                          defaultParameters,
                          targetPosition
                      )
                    : createObjectDeclaration(
                          `${moduleName}:${connector.name}`,
                          genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                          defaultParameters,
                          targetPosition
                      )
            );
        } else {
            initialSource = getInitialSource(
                createObjectDeclaration(
                    `${moduleName}:${connector.name}`,
                    genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                    [""],
                    targetPosition
                )
            );
        }
    }

    // HACK
    formArgs.targetPosition = targetPosition;

    // Pull package
    // if (packagePullStatus.current === PackagePullStatus.NOT_PULLED && !isPullingModule && !model) {
    //     setIsPullingModule(true);
    //     runCommandInBackground(`bal pull ${connector.package.organization}/${connector.moduleName}`)
    //         .then((response) => {
    //             packagePullStatus.current = response.error
    //                 ? response.message.includes("exist")
    //                     ? PackagePullStatus.EXIST
    //                     : PackagePullStatus.FAILED
    //                 : PackagePullStatus.SUCCESS;
    //         })
    //         .finally(() => {
    //             setIsPullingModule(false);
    //         });
    // }

    const stmtEditorComponent = StatementEditorWrapper({
        label: formTitle,
        initialSource,
        formArgs: { formArgs },
        config: { type: "Connector" },
        onWizardClose: onSave,
        onCancel,
        currentFile,
        getLangClient: getExpressionEditorLangClient,
        applyModifications: modifyDiagram,
        library,
        syntaxTree,
        stSymbolInfo,
        extraModules: imports,
        isLoading,
        experimentalEnabled,
        runCommandInBackground
    });

    return stmtEditorComponent;

    // return (
    //     <>
    //         {(isLoading || isPullingModule) && (
    //             <FormControl data-testid="endpoint-list-form" className={formClasses.wizardFormControlExtended}>
    //                 <div className={formClasses.formWrapper}>
    //                     <div className={formClasses.formFeilds}>
    //                         <div className={classes.container}>
    //                             <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
    //                                 <TextPreLoader
    //                                     position="absolute"
    //                                     text={`Pulling package ${connector.package.organization}/${connector.moduleName}`}
    //                                 />
    //                             </Box>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </FormControl>
    //         )}
    //         {!isLoading && !isPullingModule && stmtEditorComponent}
    //     </>
    // );
}
