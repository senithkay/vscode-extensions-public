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
    STModification,
    STSymbolInfo,
    updateServiceDeclartion
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as useFormStyles,
    FormActionButtons,
    FormTextInput
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
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
}

const HTTP_MODULE_QUALIFIER = 'http';
const HTTP_IMPORT = new Set<string>(['ballerina/http']);

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave, isLastMember, currentFile, stSymbolInfo, isEdit, getLangClient,
            onChange, applyModifications } = props;

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);

    let serviceModel: ServiceDeclaration;
    let portSemDiagMsg: string;
    let nameSemDiagMsg: string;
    if (STKindChecker.isModulePart(model)) {
        model.members.forEach(m => {
            if (STKindChecker.isServiceDeclaration(m)) {
                serviceModel = m;
                if (STKindChecker.isExplicitNewExpression(m?.expressions[0])) {
                    portSemDiagMsg = m.expressions[0]?.viewState?.diagnosticsInRange[0]?.message;
                }
            } else if (STKindChecker.isListenerDeclaration(m)) {
                portSemDiagMsg = m.initializer?.viewState?.diagnosticsInRange[0]?.message;
                nameSemDiagMsg = m.variableName?.viewState?.diagnosticsInRange[0]?.message;
            }
        })
    } else if (STKindChecker.isServiceDeclaration(model)) {
        serviceModel = model;
        const serviceListenerExpression = model.expressions.length > 0 && model.expressions[0];
        if (STKindChecker.isExplicitNewExpression(serviceListenerExpression)) {
            portSemDiagMsg = serviceListenerExpression?.viewState?.diagnosticsInRange[0]?.message;
        }
    }

    const path = serviceModel?.absoluteResourcePath
        .map((pathSegments) => pathSegments.value)
        .join('');

    // States related fields
    const [basePath, setBsePath] = useState<FormEditorField>({isInteracted: true, value: path});
    const [isListenerInteracted, setIsListenerInteracted] = useState<boolean>(false);
    const [listenerPort, setListenerPort] = useState<string>("");
    const [listenerName, setListenerName] = useState<string>("");
    const [selectedListener, setSelectedListener] = useState<string>("");

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) =>
            STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
            && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER)
        .map(([key, value]) => key);

    const serviceParamChange = async (servicePath: string, port: string, name: string) => {
        const modelPosition = model.position as NodePosition;
        const openBracePosition = serviceModel.openBraceToken.position as NodePosition;
        const updatePosition = {
            startLine: modelPosition.startLine,
            startColumn: 0,
            endLine: openBracePosition.startLine,
            endColumn: openBracePosition.startColumn - 1
        };
        const codeSnippet = getSource(updateServiceDeclartion({
            serviceBasePath: servicePath, listenerConfig: {createNewListener: false, listenerName: name, listenerPort: port, fromVar: false}
        }, updatePosition));
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, updatePosition, undefined,
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
        await serviceParamChange(value, listenerPort, listenerName);
    }

    const onListenerChange = async (port: string, name: string) => {
        setIsListenerInteracted(true);
        setListenerPort(port);
        setListenerName(name);
        await serviceParamChange(basePath.value, port, name);
    }

    const onListenerConfigSave = (modifications: STModification[]) => {
        const listenerMod: STModification = modifications.find(l => l.type === "LISTENER_DECLARATION");
        setSelectedListener(listenerMod.config.LISTENER_NAME);
        setListenerName(listenerMod.config.LISTENER_NAME);
        setListenerPort("");
        applyModifications(modifications);
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

    // useEffect(() => {
    //     setSelectedListener(selectedListener);
    // }, [selectedListener]);
    //
    // useEffect(() => {
    //     setListenerPort(listenerPort);
    // }, [listenerPort]);

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
                            isErrored: (currentComponentSyntaxDiag !== undefined && currentComponentName === "path") ||
                                (false)
                        }}
                        errorMessage={(currentComponentSyntaxDiag && currentComponentName === "path"
                            && currentComponentSyntaxDiag[0].message) || ""}
                        onBlur={null}
                        onFocus={onBasePathFocus}
                        placeholder={"/"}
                        size="small"
                        disabled={currentComponentSyntaxDiag && currentComponentName !== "path"}
                    />
                    <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                        <ListenerConfigForm
                            listenerConfig={getListenerConfig(serviceModel, isEdit)}
                            listenerList={listenerList}
                            syntaxDiag={currentComponentName === "Listener" ? currentComponentSyntaxDiag : undefined}
                            portSemDiagMsg={portSemDiagMsg}
                            activeListener={selectedListener}
                            isDisabled={currentComponentSyntaxDiag !== undefined && currentComponentName !== "Listener"}
                            onChange={onListenerChange}
                            currentFile={currentFile}
                            getLangClient={getLangClient}
                            applyModifications={onListenerConfigSave}
                            targetPosition={targetPosition}
                        />
                    </div>
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
