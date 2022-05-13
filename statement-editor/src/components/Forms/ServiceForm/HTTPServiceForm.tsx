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
import React, { useReducer, useState } from "react";

import {
    FormElementProps
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as useFormStyles,
    FormActionButtons,
    TextLabel
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ListenerDeclaration, NodePosition, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

// import { createImportStatement, createServiceDeclartion, updateServiceDeclartion } from "../../../../../../utils/modification-util";

import { ListenerConfigForm } from "./ListenerConfigFrom";

interface HttpServiceFormProps {
    model?: ServiceDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    isLastMember?: boolean;
}

const HTTP_MODULE_QUALIFIER = 'http';

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave, isLastMember } = props;
    // const { props: { stSymbolInfo }, api: { code: { modifyDiagram } } } = useDiagramContext();
    const [isValidPath, setIsValidPath] = useState(false);

    // const listenerList = Array.from(stSymbolInfo.listeners)
    //     .filter(([key, value]) =>
    //         STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
    //         && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER)
    //     .map(([key, value]) => key);


    React.useEffect(() => {
        // if (listenerList.length === 0 && !model) {
        //     dispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        // }
    }, []);

    const onBasePathChange = (path: string) => {
        // dispatch({ type: ServiceConfigActionTypes.SET_PATH, payload: path })
    }

    const handleOnSave = () => {
        if (model) {
            const modelPosition = model.position as NodePosition;
            const openBracePosition = model.openBraceToken.position as NodePosition;
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

    // const saveBtnEnabled = isServiceConfigValid(state) && isValidPath;

    const updateResourcePathValidation = (_name: string, isInValid: boolean) => setIsValidPath(!isInValid);

    const getAbsolutePathPositions = () => {
        const resourcePath = model?.absoluteResourcePath;
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
                const onKeyPath = model?.onKeyword?.position;
                return {
                    ...onKeyPath,
                    startColumn: onKeyPath?.startColumn,
                    endColumn: onKeyPath?.startColumn
                }
            }
        }
    }

    const getCustomTemplate = () => {
        if (model) {
            const resourcePath = model?.absoluteResourcePath;
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

        }else {
            return {
                defaultCodeSnippet: `service  on new http:Listener(1234) {}`,
                targetColumn: 9,
            }
        }
    }

    // const servicePathConfig: FormElementProps<ExpressionEditorProps> = {
    //     model: {
    //         name: "servicePath",
    //         displayName: 'Service path',
    //         isOptional: false
    //     },
    //     customProps: {
    //         validate: updateResourcePathValidation,
    //         interactive: true,
    //         editPosition: getAbsolutePathPositions(),
    //         customTemplate: getCustomTemplate(),
    //     },
    //     onChange: onBasePathChange,
    //     defaultValue: state.serviceBasePath
    // }

    return (
        <>
            <div className={formClasses.formContentWrapper}>
                <div className={formClasses.formNameWrapper}>
                    {/*<LowCodeExpressionEditor {...servicePathConfig} />*/}
                    <TextLabel
                        required={true}
                        textLabelId="lowcode.develop.connectorForms.HTTP.configureNewListener"
                        defaultMessage="Configure Listener :"
                    />
                </div>
                <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                    <ListenerConfigForm
                        listenerList={[]}
                        targetPosition={model ? model.position : targetPosition}
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
