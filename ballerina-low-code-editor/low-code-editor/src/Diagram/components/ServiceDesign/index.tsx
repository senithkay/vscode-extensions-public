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
import React, { useContext, useEffect, useMemo, useReducer, useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    NodePosition,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Contexts/Diagram";
import { ServiceHeader } from "./ServiceHeader";
import classNames from "classnames";
import "./style.scss";
import { ResourceBody } from "./Resource";
import { useStyles } from "./style";
import { ConfigOverlayFormStatus, getSource, TopLevelPlusIcon, updateResourceSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection, SelectDropdownWithButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import { Button, FormControl } from "@material-ui/core";
import { getUpdatedSource } from "../FormComponents/Utils";
import { useIntl } from "react-intl";
import { AddIcon } from "../../../assets/icons";
import { SERVICE_METHODS } from "./util";

export interface ServiceDesignProps {
    fnST: STNode;
    langClientPromise: Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    onClose: () => void;
    handleDiagramEdit: (model:STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
}

export function ServiceDesign(propsz: ServiceDesignProps) {

    const {
        fnST,
        onClose,
        langClientPromise,
        currentFile,
        handleDiagramEdit
    } = propsz;

    const [isPlusClicked, setPlusClicked] = useState(false);

    const classes = useStyles();
    const intl = useIntl();


    const fnSTZ = fnST as ServiceDeclaration;

    const children: JSX.Element[] = [];
    fnSTZ?.members.forEach((member) => {
        const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
        children.push(
            <div className={'service-member'} data-start-position={startPosition} >
                <ResourceBody handleDiagramEdit={handleDiagramEdit} model={member as ResourceAccessorDefinition} />
            </div>
        );
    });


    const handlePlusClick = () => {
        const lastMemberPosition: NodePosition = {
            endColumn: fnSTZ.closeBraceToken.position.endColumn,
            endLine: fnSTZ.closeBraceToken.position.endLine - 1,
            startColumn: fnSTZ.closeBraceToken.position.startColumn,
            startLine: fnSTZ.closeBraceToken.position.startLine -1
        }
        handleDiagramEdit(undefined, lastMemberPosition, {formType: "ResourceAccessorDefinition", isLoading: false });
    };

    // const handleResourceParamChange = async (
    //     resMethod: string,
    //     pathStr: string,
    //     paramStr: string,
    //     returnStr: string,
    //     stModel?: STNode,
    //     currentValue?: string) => {
    //     const pathString = pathStr ? pathStr : ".";
    //     const codeSnippet = getSource(
    //         updateResourceSignature(resMethod, pathString, paramStr, returnStr, targetPosition));
    //     const position = model ? ({
    //         startLine: model.functionName.position.startLine - 1,
    //         startColumn: model.functionName.position.startColumn,
    //         endLine: model.functionSignature.position.endLine - 1,
    //         endColumn: model.functionSignature.position.endColumn
    //     }) : targetPosition;
    //     const updatedContent = getUpdatedSource(codeSnippet, model?.source, position, undefined,
    //         true);
    //     const partialST = await getPartialSTForModuleMembers(
    //         { codeSnippet: updatedContent.trim() }, getLangClient, true
    //     );

    //     if (!partialST.syntaxDiagnostics.length) {
    //         onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
    //             { startLine: -1, startColumn: -4 });

    //         setCurrentComponentSyntaxDiag(undefined);
    //     } else {
    //         setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
    //     }

    // };

    const handleMethodChange = async (value: string) => {
        // await handleResourceParamChange(
        //     value.toLowerCase(),
        //     getResourcePath(model.relativeResourcePath),
        //     generateParameterSectionString(model?.functionSignature?.parameters),
        //     model.functionSignature?.returnTypeDesc?.type?.source
        // );
    };

    const handlePathAddClick = () => {

    }

    const httpMethodTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.httpMethod.title",
        defaultMessage: "HTTP Method"
    });

    const resourceConfigTitle = intl.formatMessage({
        id: "lowcode.develop.apiConfigWizard.resourceConfig.title",
        defaultMessage: "Configure Resource"
    });

    const resourceForm = (
        <FormControl data-testid="resource-form" className={classes.wizardFormControlExtended}>
            <div
                key={"resource"}
                className={classes.resourceWrapper}
            >
                <FormHeaderSection
                    onCancel={handlePlusClick}
                    formTitle={resourceConfigTitle}
                    defaultMessage={'Configure Resource'}
                // formType={formType}
                />
                <div className={classes.resourceMethodPathWrapper}>
                    <div className={classes.methodTypeContainer}>
                        <SelectDropdownWithButton
                            dataTestId='api-method'
                            defaultValue={""}
                            customProps={{ values: SERVICE_METHODS, disableCreateNew: true }}
                            onChange={handleMethodChange}
                            label={httpMethodTitle}
                            disabled={false}
                        />
                    </div>
                    <div className={classes.resourcePathWrapper}>
                        {/* <FieldTitle title='Resource Path' optional={true} /> */}
                        {/* <LiteExpressionEditor
                    testId="resource-path"
                    diagnostics={
                        (currentComponentName === "Path" && currentComponentSyntaxDiag)
                        || getResourcePathDiagnostics()
                    }
                    defaultValue={getResourcePath(model?.relativeResourcePath).trim()}
                    externalChangedValue={shouldUpdatePath ? getResourcePath(model?.relativeResourcePath).trim() : undefined}
                    onChange={handlePathChange}
                    completions={completions}
                    onFocus={onPathFocus}
                    disabled={currentComponentName !== "Path" && isEditInProgress}
                /> */}
                    </div>
                    <div className={classes.advancedToggleWrapper}>
                        <div className={classes.plusIconWrapper}>
                            <Button
                                data-test-id="request-add-button"
                                onClick={handlePathAddClick}
                                startIcon={<AddIcon />}
                                color="primary"
                                disabled={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    );

    return (
        <div className={classes.root}>
            <>
                <ServiceHeader onClose={onClose} />
                <div>
                    {fnSTZ && (
                        <>
                            {children}
                        </>
                    )}
                </div>
                <div className={'plus-btn-wrapper'} onClick={handlePlusClick}>
                    {
                        <TopLevelPlusIcon selected={isPlusClicked} />
                    }
                </div>
            </>
        </div>
    )
}
