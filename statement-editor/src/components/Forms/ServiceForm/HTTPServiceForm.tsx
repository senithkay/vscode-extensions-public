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

import {
    ExpressionEditorLangClientInterface,
    getSource,
    ListenerConfigFormState, STModification,
    STSymbolInfo,
    updateServiceDeclartion
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as useFormStyles,
    FormActionButtons, FormTextInput,
    TextLabel
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ListenerDeclaration, ModulePart,
    NodePosition,
    ServiceDeclaration,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StmtDiagnostic } from "../../../models/definitions";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModulePart } from "../../../utils/ls-utils";
import { FormEditorField } from "../Types";
import { getListenerConfig } from "../Utils/FormUtils";

import { ListenerConfigForm } from "./ListenerConfigFrom";

interface HttpServiceFormProps {
    model?: ServiceDeclaration | ModulePart;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    onChange: (genSource: string, partialST: STNode, moduleList?: Set<string>) => void;
    isLastMember?: boolean;
    stSymbolInfo?: STSymbolInfo;
    isEdit?: boolean;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
}

const HTTP_MODULE_QUALIFIER = 'http';
const HTTP_IMPORT = new Set<string>(['ballerina/http']);

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave, isLastMember, stSymbolInfo, isEdit, getLangClient, onChange, applyModifications } = props;

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);

    let serviceModel: ServiceDeclaration;
    if (STKindChecker.isModulePart(model)) {
        model.members.forEach(m => {
            if (STKindChecker.isServiceDeclaration(m)) {
                serviceModel = m;
            }
        })
    } else {
        serviceModel = model;
    }
    const path = serviceModel?.absoluteResourcePath
        .map((pathSegments) => pathSegments.value)
        .join('');

    // States related fields
    const [basePath, setBsePath] = useState<FormEditorField>({isInteracted: true, value: path});
    const [listenerConfig, setListenerConfig] = useState<ListenerConfigFormState>(getListenerConfig(serviceModel,
        isEdit));

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) =>
            STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
            && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER)
        .map(([key, value]) => key);

    const serviceParamChange = async (servicePath: string, config: ListenerConfigFormState) => {
        const modelPosition = model.position as NodePosition;
        const openBracePosition = serviceModel.openBraceToken.position as NodePosition;
        const updatePosition = {
            startLine: modelPosition.startLine,
            startColumn: 0,
            endLine: openBracePosition.startLine,
            endColumn: openBracePosition.startColumn - 1
        };
        const lc: ListenerConfigFormState =
            (config.listenerPort !== "" && config.fromVar === true) ? {...config, fromVar: false} : config;
        const codeSnippet = getSource(updateServiceDeclartion({
            serviceBasePath: servicePath, listenerConfig: lc
        }, updatePosition));
        const updatedContent = await getUpdatedSource(codeSnippet, model?.source, updatePosition, undefined,
            true);
        const partialST = await getPartialSTForModulePart(
            {codeSnippet: updatedContent.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            onChange(updatedContent, partialST, HTTP_IMPORT);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    }

    const onBasePathFocus = async (value: string) => {
        setCurrentComponentName("path");
    }

    const onBasePathChange = async (value: string) => {
        setBsePath({isInteracted: true, value});
        await serviceParamChange(value, listenerConfig);
    }

    const onListenerChange = async (config: ListenerConfigFormState) => {
        setCurrentComponentName("listener");
        setListenerConfig(config);
        await serviceParamChange(basePath.value, config);
    }

    const handleOnSave = () => {
        if (serviceModel) {
            const modelPosition = serviceModel.position as NodePosition;
            const openBracePosition = serviceModel.openBraceToken.position as NodePosition;
            const updatePosition = {
                startLine: modelPosition.startLine,
                startColumn: 0,
                endLine: openBracePosition.startLine,
                endColumn: openBracePosition.startColumn - 1
            };

            // modifyDiagram([
            //     updateServiceDeclartion(
            //         state,
            //         updatePosition
            //     )
            // ]);
        } else {
            // modifyDiagram([
            //     createImportStatement('ballerina', 'http', { startColumn: 0, startLine: 0 }),
            //     createServiceDeclartion(state, targetPosition, isLastMember)
            // ]);
        }
        onSave();
    }

    const getAbsolutePathPositions = () => {
        const resourcePath = serviceModel?.absoluteResourcePath;
        if (Array.isArray(resourcePath)) {
            if (resourcePath.length) {
                const firstElement =  resourcePath[0]?.position;
                const lastElement =  resourcePath[resourcePath.length - 1]?.position;
                return {
                    ...lastElement,
                    startColumn: firstElement?.startColumn,
                    startLine: firstElement?.startLine
                }

            } else {
                const onKeyPath = serviceModel?.onKeyword?.position;
                return {
                    ...onKeyPath,
                    startColumn: onKeyPath?.startColumn,
                    endColumn: onKeyPath?.startColumn
                }
            }
        }
    }

    const getCustomTemplate = () => {
        if (serviceModel) {
            const resourcePath = serviceModel?.absoluteResourcePath;
            if (Array.isArray(resourcePath)) {
                if (resourcePath.length) {
                    return {
                        defaultCodeSnippet: "",
                        targetColumn: 1,
                    }

                } else {
                    return {
                        defaultCodeSnippet: " ",
                        targetColumn: 1,
                    }
                }
            }

        } else {
            return {
                defaultCodeSnippet: `service  on new http:Listener(1234) {}`,
                targetColumn: 9,
            }
        }
    }

    return (
        <>
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    <FormTextInput
                        label="Path"
                        dataTestId="base-path"
                        defaultValue={basePath.value}
                        onChange={onBasePathChange}
                        customProps={{
                            isErrored: (currentComponentSyntaxDiag !== undefined && currentComponentName === "path")
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "path"
                            && currentComponentSyntaxDiag[0].message)}
                        onBlur={null}
                        onFocus={onBasePathFocus}
                        placeholder={"/"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "path"}
                    />
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.connectorForms.HTTP.configureNewListener"
                        defaultMessage="Configure Listener :"
                    />
                </div>
                <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                    <ListenerConfigForm
                        model={serviceModel}
                        listenerConfig={listenerConfig}
                        listenerList={listenerList}
                        targetPosition={serviceModel ? serviceModel.position : targetPosition}
                        onChange={onListenerChange}
                    />
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText={"Save"}
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={true}
            />
        </>
    )
}
