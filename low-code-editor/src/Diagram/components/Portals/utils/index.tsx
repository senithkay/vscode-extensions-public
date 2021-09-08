/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { ReactNode } from "react";

import {
    ActionStatement,
    CaptureBindingPattern, CheckAction,
    CheckExpression,
    ImplicitNewExpression, ListConstructor, LocalVarDecl, MappingConstructor, NamedArg, NumericLiteral,
    ParenthesizedArgList,
    PositionalArg, RemoteMethodCallAction, RequiredParam, SimpleNameReference, SpecificField,
    STKindChecker,
    STNode, StringLiteral, traversNode, TypeCastExpression
} from "@ballerina/syntax-tree";
import { DocumentSymbol, SymbolInformation } from "monaco-languageclient";

import { ConnectionDetails } from "../../../../api/models";
import { ActionConfig, ConnectorConfig, FormField, FormFieldReturnType, FunctionDefinitionInfo, ManualConfigType, PrimitiveBalType, WizardType } from "../../../../ConfigurationSpec/types";
import { DiagramEditorLangClientInterface, STSymbolInfo } from "../../../../Definitions";
import { BallerinaConnectorInfo, Connector } from "../../../../Definitions/lang-client-extended";
import { filterCodeGenFunctions, filterConnectorFunctions } from "../../../utils/connector-form-util";
import { getAllVariables as retrieveVariables } from "../../../utils/mixins";
import {
    addToFormFieldCache,
    getConnectorDefFromCache,
    getFormFieldFromFileCache,
    getFromFormFieldCache,
    isSTActionInvocation
} from "../../../utils/st-util";
import { StatementViewState } from "../../../view-state";
import { DraftInsertPosition } from "../../../view-state/draft";
import * as Icons from "../../Connector/Icon";
import { ConfigWizardState } from "../../ConnectorConfigWizard";
import * as ConnectorExtension from "../../ConnectorExtensions";
import * as Elements from "../ConfigForm/Elements";
import { getUnionFormFieldName } from "../ConfigForm/Elements/Union";
import * as Forms from "../ConfigForm/forms";
import { FormElementProps } from "../ConfigForm/types";
import * as OverlayElement from "../Overlay/Elements";

import { keywords, symbolKind } from "./constants";

const receivedRecords: Map<string, STNode> = new Map();
// in order to ignore classes, object and enum type references
const ignoreList = [
    // sl alpha5
    'ballerina/oauth2:1.1.0-alpha8:HttpVersion',
    'ballerina/oauth2:1.1.0-alpha8:CredentialBearer',
    'ballerina/oauth2:1.1.0-alpha8:ClientConfiguration',
    'ballerina/oauth2:1.1.0-alpha8:ClientCredentialsGrantConfig',
];

export function getOverlayElement(
    type: string,
    data: any,
    onClose: () => void, onClick: () => void,
    onChange?: (event: object, value: any) => void
): ReactNode {
    const Element = (OverlayElement as any)[type];
    return (
        <Element type={type} data={data} onClose={onClose} onClick={onClick} onChange={onChange} />
    );
}

export function getFormElement(elementProps: FormElementProps, type: string) {
    if (type) {
        const FormElement = (Elements as any)[type];
        // todo: check if this logic should be moved down to element component level
        if (elementProps.model.value) {
            if (type === 'xml') {
                const xmlRegex = /xml\ \`(.*\n?)\`/g
                const matchedRegex = xmlRegex.exec(elementProps.model.value);
                elementProps.defaultValue = matchedRegex ? matchedRegex[1] : elementProps.model.value;
            } else if (type === 'json') {
                elementProps.defaultValue = elementProps.model.value;
            }
        }

        return (
            <FormElement {...elementProps} />
        );
    } else {
        return null;
    }
}

export function getForm(type: string, args: any) {
    const Form = (Forms as any)[type];
    return Form ? (
        <Form {...args} />
    ) : null;
}

export function getConnectorComponent(type: string, args: any) {
    const ConnectorExtensionComponent = (ConnectorExtension as any)[type];
    return ConnectorExtensionComponent ? (
        <ConnectorExtensionComponent {...args} />
    ) : undefined;
}

export function getFieldName(fieldName: string): string {
    return keywords.includes(fieldName) ? "'" + fieldName : fieldName;
}

export function getParams(formFields: FormField[], depth = 1): string[] {
    const paramStrings: string[] = [];
    formFields.forEach(formField => {
        const isDefaultValue = formField.defaultValue && (formField.defaultValue === formField.value);
        let paramString: string = "";
        if (formField.isParam && !formField.noCodeGen && !isDefaultValue) {
            if (formField.isDefaultableParam && formField.value) {
                paramString += `${formField.name} = `;
            }
            if (formField.type === "string" && formField.value) {
                paramString += formField.value;
            } else if (formField.type === "collection" && !formField.hide && formField.value) {
                paramString += formField.value.toString();
            } else if (formField.type === "map" && formField.value) {
                paramString += formField.value;
            } else if ((formField.type === "int" || formField.type === "boolean" || formField.type === "float" ||
                formField.type === "json" || formField.type === "httpRequest") && formField.value) {
                paramString += formField.value;
            } else if (formField.type === "record" && formField.fields  && formField.fields.length > 0 && !formField.isReference) {
                let recordFieldsString: string = "";
                let firstRecordField = false;

                formField.fields.forEach(field => {
                    // Skip default values if no changes
                    if (field.defaultValue && field.defaultValue === field.value) {
                        return;
                    }
                    if (field.type === "string" && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if ((field.type === "int" || field.type === "boolean" || field.type === "float") && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "map" && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        // HACK:    current map type will render by expression-editor component.
                        //          expression-editor component will set value property directly.
                        //          need to implement fetch inner field's values of map object.
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "collection" && !field.hide && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "union" && !field.hide && field.isUnion) {
                        const name = getFieldName(field.name ? field.name : field.typeInfo.name);
                        if (name) {
                            const selectedField: FormField = field.fields?.find((subField: FormField) => {
                                const fieldName = getUnionFormFieldName(subField);
                                return (fieldName !== undefined) && (fieldName === field.selectedDataType);
                            });
                            if (selectedField) {
                                const params = getParams([selectedField], depth + 1);
                                if (params && params.length > 0) {
                                    if (firstRecordField) {
                                        recordFieldsString += ", ";
                                    } else {
                                        firstRecordField = true;
                                    }
                                    recordFieldsString += name + ": " + params;
                                }
                            } else if (field.value) {
                                if (firstRecordField) {
                                    recordFieldsString += ", ";
                                } else {
                                    firstRecordField = true;
                                }
                                recordFieldsString += name + ": " + field.value;
                            }
                        }
                    } else if (field.type === "record" && !field.hide && !field.isReference) {
                        const name = getFieldName(field.name ? field.name : field.typeInfo.name);
                        if (name) {
                            const fieldArray: FormField[] = [
                                {
                                    isParam: true,
                                    type: PrimitiveBalType.Record,
                                    fields: field.fields
                                }
                            ]
                            const params = getParams(fieldArray, depth + 1);
                            if (params && params.length > 0) {
                                if (firstRecordField) {
                                    recordFieldsString += ", ";
                                } else {
                                    firstRecordField = true;
                                }
                                recordFieldsString += name + ": " + params;
                            }
                        }
                    }
                });
                if (recordFieldsString !== "" && recordFieldsString !== "{}" && recordFieldsString !== undefined) {
                    paramString += "{" + recordFieldsString + "}";
                }else if (recordFieldsString === "" && !formField.optional && depth === 1){
                    paramString += "{}";
                }
                // HACK: OAuth2RefreshTokenGrantConfig record contains *oauth2:RefreshTokenGrantConfig
                //      code generation doesn't need another record inside OAuth2RefreshTokenGrantConfig
                //      here skip that RefreshTokenGrantConfig record form code string
                if (paramString.includes("RefreshTokenGrantConfig")) {
                    paramString = paramString.replace("{RefreshTokenGrantConfig: ", "").replace("}", "");
                }
            } else if (formField.type === PrimitiveBalType.Union && formField.isUnion && formField.value) {
                paramString += formField.value;
            } else if (formField.type === PrimitiveBalType.Nil) {
                paramString += "()";
            } else if (formField.type === PrimitiveBalType.Xml && formField.value) {
                const xmlRegex = /^xml\ `(.*)`$/g;
                if (xmlRegex.test(formField.value)) {
                    paramString = formField.value;
                } else {
                    paramString += "xml `" + formField.value + "`";
                }
            } else if (formField.type === "handle" && formField.value) {
                paramString += formField.value;
            }

            if (paramString !== "") {
                paramStrings.push(paramString);
            }
        }
    });

    return paramStrings;
}

export function isValidTextInput(inputValue: string, type: any): boolean {
    let isValueValid: boolean = false;
    if (type === PrimitiveBalType.Int) {
        const intRegex = new RegExp("^\\d+$");
        if (intRegex.test(inputValue)) {
            isValueValid = true;
        }
    } else if (type === PrimitiveBalType.Float) {
        const floatRegex = new RegExp("^\\d+(\\.\\d)?\\d*$");
        if (floatRegex.test(inputValue)) {
            isValueValid = true;
        }
    } else if (type === PrimitiveBalType.String) {
        isValueValid = true;
    } else {
        isValueValid = true;
    }
    return isValueValid;
}

export function validateEmail(inputValue: string): boolean {
    const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    if (emailRegex.test(inputValue)) {
        return true;
    }
    return false;
}

export function getCollectionForRadio(model: FormField): string[] {
    const collection: string[] = [];
    switch (model.type) {
        case PrimitiveBalType.Boolean:
            collection.push("true");
            collection.push("false");
            break;
        default:
            break;
    }
    return collection;
}

export function matchEndpointToFormField(endPoint: LocalVarDecl, formFields: FormField[]) {
    let implicitExpr: ImplicitNewExpression;
    switch (endPoint.initializer.kind) {
        case "CheckExpression":
            implicitExpr = (endPoint.initializer as CheckExpression).expression as ImplicitNewExpression;
            break;
        default:
            implicitExpr = endPoint.initializer as ImplicitNewExpression;
    }
    const parenthesizedArgs: ParenthesizedArgList = implicitExpr.parenthesizedArgList as ParenthesizedArgList;
    let nextValueIndex = 0;
    for (const arg of parenthesizedArgs.arguments) {
        if ((parenthesizedArgs.arguments === undefined) || (formFields.length <= nextValueIndex)) {
            break;
        }

        const positionalArg: PositionalArg = arg as PositionalArg;
        const formField = formFields[nextValueIndex];
        if (positionalArg.kind === "PositionalArg" || positionalArg.kind === "NamedArg") {
            if (formField.type === "string" || formField.type === "int" || formField.type === "boolean" ||
                formField.type === "float" || formField.type === "json" || formField.type === "xml") {
                if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                    const stringLiteral: StringLiteral = positionalArg.expression as StringLiteral;
                    formField.value = stringLiteral.literalToken.value;
                } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                    const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = numericLiteral.literalToken.value;
                } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                    const booleanLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = booleanLiteral.literalToken.value;
                } else {
                    formField.value = positionalArg.expression.source;
                }
                nextValueIndex++;
            } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[], formField.fields);
                    nextValueIndex++;
                }
            } else if (formField.type === "union" && formField.isUnion) {
                formField.value = positionalArg.expression?.source;
            }
        }
    }
}

export function mapRecordLiteralToRecordTypeFormField(specificFields: SpecificField[], formFields: FormField[]) {
    specificFields.forEach(specificField => {
        if (specificField.kind !== "CommaToken") {
            formFields.forEach(formField => {
                if (formField.name === specificField.fieldName.value) {
                    // if the assigned value is one of inbuilt type
                    formField.value = (STKindChecker.isStringLiteral(specificField.valueExpr) ||
                        STKindChecker.isNumericLiteral(specificField.valueExpr) ||
                        STKindChecker.isBooleanLiteral(specificField.valueExpr)) ?

                        formField.value = specificField.valueExpr.literalToken.value :
                        formField.value = specificField.valueExpr.source;

                    // if the assigned value is a record
                    if (specificField.valueExpr.kind === 'MappingConstructor') {
                        const mappingField = specificField.valueExpr as MappingConstructor;
                        if (formField.type === "union") {
                            formField.fields.forEach(subFormField => {
                                if (subFormField.type === "record" && subFormField.fields) {
                                    const subFields = subFormField.fields;
                                    if (subFields) {
                                        mapRecordLiteralToRecordTypeFormField(mappingField.fields as SpecificField[], subFields);
                                        // find selected data type using non optional field's value
                                        const valueFilled = subFields.find(field => (field.optional === false && field.value));
                                        if (valueFilled) {
                                            formField.selectedDataType = getUnionFormFieldName(subFormField);
                                        }
                                    }
                                }
                            });
                        } else {
                            mapRecordLiteralToRecordTypeFormField(mappingField.fields as SpecificField[], formField.fields);
                        }
                    }

                    // if the assigned value is an array
                    if (specificField.valueExpr.kind === 'ListConstructor') {
                        const listExpr = specificField.valueExpr as ListConstructor;
                        formField.value = listExpr.source;
                        formField.fields = formField?.fields ? formField.fields : [];
                    }
                }
            })
        }
    });
}

export function getRestParamFieldValue(remoteMethodCallArguments: PositionalArg[], currentFieldIndex: number) {
    const varArgValues: string[] = [];
    for (let i = currentFieldIndex; i < remoteMethodCallArguments.length; i++) {
        const varArgs: PositionalArg = remoteMethodCallArguments[i] as PositionalArg;
        const literalExpression: any = varArgs.expression;
        varArgValues.push(literalExpression.literalToken.value);
    }
    return varArgValues.join(",");
}

export function matchActionToFormField(remoteCall: RemoteMethodCallAction, formFields: FormField[]) {
    const remoteMethodCallArguments = remoteCall.arguments.filter(arg => arg.kind !== 'CommaToken');
    let nextValueIndex = 0;
    for (const formField of formFields) {
        if ((remoteMethodCallArguments === undefined) || (remoteMethodCallArguments.length <= nextValueIndex)) {
            break;
        }

        if (STKindChecker.isNamedArg(remoteMethodCallArguments[nextValueIndex])) {
            const namedArg: NamedArg = remoteMethodCallArguments[nextValueIndex] as NamedArg;
            const fieldForNamedArg = formFields.find(field => field.name === namedArg.argumentName.name.value);
            if (fieldForNamedArg) {
                fieldForNamedArg.value = namedArg.expression.source;
            }
            nextValueIndex++;
        } else {
            const positionalArg: PositionalArg = remoteMethodCallArguments[nextValueIndex] as PositionalArg;
            if (formField.type === "string" || formField.type === "int" || formField.type === "boolean"
                || formField.type === "float" || formField.type === "httpRequest") {
                if (STKindChecker.isStringLiteral(positionalArg.expression) ||
                    STKindChecker.isNumericLiteral(positionalArg.expression) ||
                    STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                    if (formField.isRestParam) {
                        formField.value = getRestParamFieldValue(remoteMethodCallArguments as PositionalArg[],
                            nextValueIndex);
                    } else {
                        const literalExpression = positionalArg.expression;
                        formField.value = literalExpression.literalToken.value;
                    }
                } else {
                    formField.value = positionalArg.expression.source;
                }
                nextValueIndex++;
            } else if (formField.type === 'handle') {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.type === 'collection') {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[], formField.fields);
                    nextValueIndex++;
                }
            } else if (formField.type === "record" && STKindChecker.isSimpleNameReference(positionalArg.expression)) {
                formField.value = positionalArg.expression.name.value;
                nextValueIndex++;
            } else if (formField.type === "union" && formField.isUnion) {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.type === "json") {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            }
        }
    }
}

export function getVaribaleNamesFromVariableDefList(asts: STNode[]) {
    if (asts === undefined) {
        return [];
    }
    return (asts as LocalVarDecl[]).map((item) => (item?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.value);
}

export function getConnectorIcon(iconId: string, props?: any): React.ReactNode {
    const Icon = (Icons as any)[iconId.replace('.', '_')];
    const DefaultIcon = (Icons as any).default;
    return Icon ? (
        <Icon {...props} />
    ) : <DefaultIcon {...props} />;
}

export function getConnectorIconSVG(connector: BallerinaConnectorInfo, scale: number = 1): React.ReactNode {
    const iconId = getConnectorIconId(connector);
    const Icon = (Icons as any)[iconId.replace('.', '_')];
    const DefaultIcon = (Icons as any).default;
    const props = {
        scale
    }
    return Icon ? (
        <Icon {...props} />
    ) : <DefaultIcon {...props} />;
}

export function getExistingConnectorIconSVG(iconId: string, scale: number = 1): React.ReactNode {
    const Icon = (Icons as any)[iconId.replace('.', '_')];
    const DefaultIcon = (Icons as any).default;
    const props = {
        scale
    }
    return Icon ? (
        <Icon {...props} />
    ) : <DefaultIcon {...props} />;
}

export function getConnectorIconId(connector: BallerinaConnectorInfo) {
    return `${connector.moduleName}_${connector.name}`;
}

export function genVariableName(defaultName: string, variables: string[]): string {
    const baseName: string = convertToCamelCase(defaultName);
    let varName: string = baseName.includes('.') ? baseName.split('.').pop() : baseName;
    let index = 0;
    while (variables.includes(varName)) {
        index++;
        varName = baseName + index;
    }
    return varName;
}

function convertToCamelCase(variableName: string): string {
    return variableName
        .replace(/\s(.)/g, (a) => {
            return a.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, (b) => {
            return b.toLowerCase();
        });
}

export function addAiSuggestion(targetVariable: string, aiSuggestion: string, formFields: FormField[]) {
    // Todo: optimize the tree traversing algorithm
    formFields.forEach((formField: FormField) => {
        if (formField.fields) {
            addAiSuggestion(targetVariable, aiSuggestion, formField.fields);
        } else {
            if (formField.name === targetVariable) {
                formField.aiSuggestion = aiSuggestion;
            }
        }
    })
}

export function getAllVariablesForAi(symbolInfo: STSymbolInfo): { [key: string]: any } {
    const variableCollection: { [key: string]: any } = {};
    symbolInfo.variables.forEach((variableNodes: STNode[], type: string) => {
        variableNodes.forEach((variableNode) => {
            if (STKindChecker.isRequiredParam(variableNode)) {
                // Handle function definition params
                variableCollection[(variableNode as RequiredParam).paramName.value] = {
                    "type": type,
                    "position": 0,
                    "isUsed": 0
                }
            } else if (STKindChecker.isLocalVarDecl(variableNode)) {
                const variableDef: LocalVarDecl = variableNode as LocalVarDecl;
                const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
                    CaptureBindingPattern;
                variableCollection[variable.variableName.value] = {
                    "type": type,
                    "position": 0,
                    "isUsed": 0
                }
            }
        });
    });
    symbolInfo.endpoints.forEach((variableNodes: STNode, type: string) => {
        const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
        const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        if (!variableCollection[variable.variableName.value]) {
            variableCollection[variable.variableName.value] = {
                "type": type,
                "position": 0,
                "isUsed": 0
            }
        }
    });
    symbolInfo.actions.forEach((variableNodes: STNode, type: string) => {
        if (variableNodes.kind === "LocalVarDecl") {
            const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
            const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
                CaptureBindingPattern;
            if (!variableCollection[variable.variableName.value]) {
                variableCollection[variable.variableName.value] = {
                    "type": type,
                    "position": 0,
                    "isUsed": 0
                }
            }
        }
    });
    return variableCollection;
}

function isDocumentSymbol(symbol: DocumentSymbol | SymbolInformation): symbol is DocumentSymbol {
    return symbol && (symbol as DocumentSymbol).range !== undefined;
}

function getSymbolKind(kind: number): string {
    return symbolKind[kind]
}

export function getMapTo(_formFields: FormField[], targetPosition: DraftInsertPosition): { [key: string]: any } {
    const mapTo: { [key: string]: any } = {};

    function iterateFormFields(formFields: FormField[]) {
        formFields.forEach((formField: FormField) => {
            if (formField.fields) {
                iterateFormFields(formField.fields);
            } else {
                if (formField.name && formField.type) {
                    mapTo[formField.name] = {
                        "type": formField.type,
                        "position": targetPosition.line,
                        "isUsed": 0
                    }
                }
            }
        });
    };

    iterateFormFields(_formFields);
    return mapTo;
}

export async function fetchConnectorInfo(connector: Connector, model?: STNode, symbolInfo?: STSymbolInfo,
                                         langServerURL?: string,
                                         getDiagramEditorLangClient?: (url: string) => Promise<DiagramEditorLangClientInterface>,
                                         userEmail?: string)
                                         : Promise<ConfigWizardState> {

    // get form fields from browser cache
    let functionDefInfo = await getFromFormFieldCache(connector);
    const connectorConfig = new ConnectorConfig();

    // if (!functionDefInfo) {
    //     // get form fields from file cache
    //     functionDefInfo = await getFormFieldFromFileCache(connector);
    //     // save form fields in browser cache
    //     if (functionDefInfo) {
    //         await addToFormFieldCache(connector, functionDefInfo);
    //     }
    // }

    if (!functionDefInfo) {
        // generate form fields form connector syntax tree
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient(langServerURL);
        const functionDefMap: Map<string, FunctionDefinitionInfo> = new Map();

        if (connector) {
            const connectorResp = await langClient.getConnector(connector);
            if (connectorResp.connector?.functions) {
                connectorResp.connector?.functions.forEach((functionInfo: FunctionDefinitionInfo) => {
                    functionDefMap.set(functionInfo.name, functionInfo);
                });
                functionDefInfo = functionDefMap;
            }
        }
        // save form fields in browser cache
        await addToFormFieldCache(connector, functionDefInfo);
    }

    // Filter connector functions to have better usability.
    functionDefInfo = filterConnectorFunctions(connector, functionDefInfo, connectorConfig, userEmail);
    if (model) {
        const variable: LocalVarDecl = model as LocalVarDecl;
        const viewState: StatementViewState = model.viewState as StatementViewState;
        if (isSTActionInvocation(variable)) {
            let remoteCall: RemoteMethodCallAction;
            let returnVarName: string;

            switch (model.kind) {
                case "LocalVarDecl":
                    switch (variable.initializer.kind) {
                        case 'TypeCastExpression':
                            const initializer: TypeCastExpression = variable.initializer as TypeCastExpression
                            remoteCall = (initializer.expression as CheckAction).expression as RemoteMethodCallAction;
                            break;
                        case 'RemoteMethodCallAction':
                            remoteCall = variable.initializer as RemoteMethodCallAction;
                            break;
                        default:
                            remoteCall = (variable.initializer as CheckAction).expression;
                    }
                    const bindingPattern: CaptureBindingPattern = variable.typedBindingPattern.bindingPattern as
                        CaptureBindingPattern;
                    returnVarName = bindingPattern.variableName.value;
                    break;

                case "ActionStatement":
                    const statement = model as ActionStatement;
                    remoteCall = (statement.expression as CheckAction).expression;
                    break;

                default:
                    // TODO: need to handle this flow
                    return undefined;
            }

            if (remoteCall) {
                const configName: SimpleNameReference = remoteCall.expression as SimpleNameReference;
                const actionName: SimpleNameReference = remoteCall.methodName as SimpleNameReference;
                if (remoteCall && actionName) {
                    const action: ActionConfig = new ActionConfig();
                    action.name = actionName.name.value;
                    action.returnVariableName = returnVarName;
                    connectorConfig.action = action;
                    connectorConfig.name = configName.name.value;
                    connectorConfig.action.fields = functionDefInfo.get(connectorConfig.action.name).parameters;
                    matchActionToFormField(remoteCall, connectorConfig.action.fields);
                }
            }

        } else if (viewState.isEndpoint) {
            const bindingPattern: CaptureBindingPattern = variable.typedBindingPattern.bindingPattern as
                CaptureBindingPattern;
            const endpointVarName: string = bindingPattern.variableName.value;
            if (endpointVarName) {
                connectorConfig.name = endpointVarName;
            }
        }
        connectorConfig.connectorInit = functionDefInfo.get("init") ?
            functionDefInfo.get("init").parameters
            : functionDefInfo.get("__init").parameters;
        const matchingEndPoint: LocalVarDecl = symbolInfo.endpoints.get(connectorConfig.name) as LocalVarDecl;
        if (matchingEndPoint) {
            connectorConfig.initPosition = matchingEndPoint.position;
            matchEndpointToFormField(matchingEndPoint, connectorConfig.connectorInit);
        }
    }

    connectorConfig.existingConnections = symbolInfo.variables.get(getFormattedModuleName(connector.packageName) + ":" + connector.name);

    return {
        isLoading: false,
        connector,
        wizardType: model ? WizardType.EXISTING : WizardType.NEW,
        functionDefInfo,
        connectorConfig,
        model
    };
}

export const getKeyFromConnection = (connection: ConnectionDetails, key: string) => {
    return connection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key)?.codeVariableKey || "";
};

export function getOauthParamsFromConnection(connectorName: string, connectionDetail: ConnectionDetails, type?: string): any {
    let tokenObjectName = "oauthClientConfig";
    switch (connectorName) {
        case "github": {
            return [`{
                accessToken: ${getKeyFromConnection(connectionDetail, 'accessTokenKey')}}`];
        }
        case "google calendar": {
            tokenObjectName = "oauth2Config";
            break;
        }
        case "google drive": {
            tokenObjectName = "clientConfig";
            break;
        }
        case "gmail":
        case "google sheets": {
            tokenObjectName = "oauthClientConfig";
            break;
        }
    }
    if (type && type === "OAuth2RefreshTokenGrantConfig") {
        let refreshUrl = getKeyFromConnection(connectionDetail, 'refreshUrlKey')
        if (refreshUrl === ""){
                refreshUrl = getKeyFromConnection(connectionDetail, 'tokenEpKey');
        }

        return [`{
            ${tokenObjectName}: {
                clientId: ${getKeyFromConnection(connectionDetail, 'clientIdKey')},
                clientSecret: ${getKeyFromConnection(connectionDetail, 'clientSecretKey')},
                refreshToken: ${getKeyFromConnection(connectionDetail, 'refreshTokenKey')},
                refreshUrl : ${refreshUrl}
            }
         }`];
    } else if (type && type === "BearerTokenConfig") {
        return [`{
            ${tokenObjectName}: {
                token: ${getKeyFromConnection(connectionDetail, 'tokenKey')}
            }
         }`];
    }
}

export function getInitReturnType(functionDefinitions: Map<string, FunctionDefinitionInfo>): boolean {
    const returnTypeField = functionDefinitions.get("init")?.returnType;
    return getFormFieldReturnType(returnTypeField).hasError;
}

export function getActionReturnType(action: string, functionDefinitions: Map<string, FunctionDefinitionInfo>): FormFieldReturnType {
    if (!action) {
        return undefined;
    }
    const returnTypeField = functionDefinitions.get(action)?.returnType;
    return getFormFieldReturnType(returnTypeField);
}

function getFormFieldReturnType(formField: FormField, depth = 1): FormFieldReturnType {
    const response: FormFieldReturnType = {
        hasError: formField?.isErrorType ? true : false,
        hasReturn: false,
        returnType: "var",
        importTypeInfo: []
    };
    const primitives = [ "string", "int", "float", "boolean", "json", "xml", "handle" ];
    const returnTypes: string[] = [];

    if (formField && formField?.isParam) {
        switch (formField.type) {
            case "union":
                formField?.fields.forEach(field => {
                    if (field?.isParam) {
                        const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                        const type = returnTypeResponse.returnType;
                        response.hasError = returnTypeResponse.hasError || response.hasError;
                        response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];

                        // collector
                        if (type && type !== "var") {
                            returnTypes.push(type);
                        }
                    }
                });

                if (returnTypes.length > 0) {
                    if (returnTypes.length > 1) {
                        // concat all return types with | character
                        response.returnType = returnTypes.reduce((fullType, type) => {
                            return `${fullType}${type !== '?' ? '|' : ''}${type}`;
                        });
                    } else {
                        response.returnType = returnTypes[ 0 ];
                        if (response.returnType === '?') {
                            response.hasReturn = false;
                        }
                    }
                }
                break;

            case "collection":
                if (formField?.isParam && formField?.collectionDataType) {
                    const returnTypeResponse = getFormFieldReturnType(formField.collectionDataType, depth + 1);
                    response.returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                }

                if (response.returnType && formField?.isArray) {
                    // set array type
                    response.returnType = response.returnType.includes('|') ? `(${response.returnType})[]` : `${response.returnType}[]`;
                }
                break;

            case "tuple":
                formField?.fields.forEach(field => {
                    if (field?.isParam) {
                        const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                        const type = returnTypeResponse.returnType;
                        response.hasError = returnTypeResponse.hasError || response.hasError;
                        response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                        // collector
                        if (type && type !== "var") {
                            returnTypes.push(type);
                        }
                    }
                });

                if (returnTypes.length > 0) {
                    response.returnType = returnTypes.length > 1 ? `[${returnTypes.join(',')}]` : returnTypes[ 0 ];
                }
                break;

            default:
                if (formField.isParam) {
                    let type = "";
                    if (formField.type === "error" || formField.isErrorType) {
                        formField.isErrorType = true;
                        response.hasError = true;
                    }
                    if (type === "" && formField.typeInfo && !formField.isErrorType) {
                        // set class/record types
                        type = `${getFormattedModuleName(formField.typeInfo.modName)}:${formField.typeInfo.name}`;
                        response.hasReturn = true;
                        response.importTypeInfo.push(formField.typeInfo);
                    }
                    if (type === "" && formField.typeInfo && formField?.isStream && formField.isErrorType) {
                        // set stream record type with error
                        type = `${getFormattedModuleName(formField.typeInfo.modName)}:${formField.typeInfo.name},error`;
                        response.hasReturn = true;
                        response.importTypeInfo.push(formField.typeInfo);
                        // remove error return
                        response.hasError = false;
                    }
                    if (type === "" && !formField.typeInfo && primitives.includes(formField.type) &&
                        formField?.isStream && formField.isErrorType) {
                        // set stream record type with error
                        type = `${formField.type},error`;
                        response.hasReturn = true;
                        // remove error return
                        response.hasError = false;
                    }
                    if (type === "" && !formField.isStream && formField.type && primitives.includes(formField.type)) {
                        // set primitive types
                        type = formField.type;
                        response.hasReturn = true;
                    }

                    // filters
                    if (formField?.isArray) {
                        // set array type
                        type = type.includes('|') ? `(${type})[]` : `${type}[]`;
                    }
                    if (formField?.optional) {
                        // set optional tag
                        type = type.includes('|') ? `(${type})?` : `${type}?`;
                    }
                    if (type !== "" && formField?.isStream) {
                        // set stream tags
                        type = `stream<${type}>`;
                    }

                    if (type) {
                        response.returnType = type;
                    }
                }
        }
    }

    return response;
}

function getFormFieldValue(formFields: FormField[], connectorName: string, key: string) {
    switch (connectorName) {
        case "github": {
            return formFields[0].fields[1].value;
        }
        case "google sheets":
            return formFields.find(field => field.name === "spreadsheetConfig").fields
                .find(field => field.name === "oauthClientConfig").fields
                .find(field => field.name === key).value || "";
        case "gmail": {
            return formFields.find(field => field.name === "gmailConfig").fields
                .find(field => field.name === "oauthClientConfig").fields
                .find(field => field.name === key).value || "";
        }
        case "google calendar":
            return formFields.find(field => field.name === "calendarConfig").fields
                .find(field => field.name === "oauth2Config").fields
                .find(field => field.name === key).value || "";
    }
}

export function getOauthParamsFromFormFields(connectorName: string, formFields: FormField[]): any {
    switch (connectorName) {
        case "github": {
            const githubAccessToken = getFormFieldValue(formFields, connectorName, 'accessToken');
            return (`{
                accessToken: ${githubAccessToken}
            }`);
        }
        case "gmail":
        case "google sheets": {
            const clientId = getFormFieldValue(formFields, connectorName, 'clientId');
            const clientSecret = getFormFieldValue(formFields, connectorName, 'clientSecret');
            const refreshUrl = getFormFieldValue(formFields, connectorName, 'refreshUrl');
            const refreshToken = getFormFieldValue(formFields, connectorName, 'refreshToken');
            return (`{
                oauthClientConfig: {
                    clientId: ${clientId},
                    clientSecret: ${clientSecret},
                    refreshToken: ${refreshToken},
                    refreshUrl: ${refreshUrl}
                }
             }`);
        }
        case "google calendar": {
            const clientId = getFormFieldValue(formFields, connectorName, 'clientId');
            const clientSecret = getFormFieldValue(formFields, connectorName, 'clientSecret');
            const refreshUrl = getFormFieldValue(formFields, connectorName, 'refreshUrl');
            const refreshToken = getFormFieldValue(formFields, connectorName, 'refreshToken');
            return (`{
                oauth2Config: {
                    clientId: ${clientId},
                    clientSecret: ${clientSecret},
                    refreshToken: ${refreshToken},
                    refreshUrl: ${refreshUrl}
                }
             }`);
        }
    }
}

export function getOauthConnectionConfigurables(connectorName: string, connectionDetail: ConnectionDetails, configurables?: Map<string, STNode>, type?: string): any {
    switch (connectorName) {
        case "github": {
            const githubAccessToken = getKeyFromConnection(connectionDetail, 'accessTokenKey');
            if (!configurables?.get(githubAccessToken)) {
                return `configurable string ${githubAccessToken} = ?;`;
            }
            break;
        }
        case "google sheets":
        case "google calendar":
        case "google drive":
        case "gmail": {
            const clientId = getKeyFromConnection(connectionDetail, 'clientIdKey');
            const clientSecret = getKeyFromConnection(connectionDetail, 'clientSecretKey');
            let refreshUrl = getKeyFromConnection(connectionDetail, 'refreshUrlKey');
            if (refreshUrl === ""){
                refreshUrl = getKeyFromConnection(connectionDetail, 'tokenEpKey');
            }
            const refreshToken = getKeyFromConnection(connectionDetail, 'refreshTokenKey');
            const token = getKeyFromConnection(connectionDetail, 'tokenKey');
            let statement = '';

            if (type && type === "OAuth2RefreshTokenGrantConfig") {
                if (!configurables?.get(clientId)) {
                    statement += `configurable string ${clientId} = ?;\n`;
                }
                if (!configurables?.get(clientSecret)) {
                    statement += `configurable string ${clientSecret} = ?;\n`;
                }
                if (!configurables?.get(refreshUrl)) {
                    statement += `configurable string ${refreshUrl} = ?;\n`;
                }
                if (!configurables?.get(refreshToken)) {
                    statement += `configurable string ${refreshToken} = ?;\n`;
                }
            } else if (type && type === "BearerTokenConfig") {
                if (!configurables?.get(token)) {
                    statement += `configurable string ${token} = ?;\n`;
                }
            }

            return statement !== '' ? statement : null;
        }
    }
    return null;
}

export function getOauthConnectionFromFormField(formField: FormField, allConnections: ConnectionDetails[]): ConnectionDetails {
    const connectorModuleName = formField?.typeInfo.modName;
    let variableKey: string;
    let activeConnection: ConnectionDetails;

    switch (connectorModuleName) {
        case "github":
            variableKey = formField.fields?.find(field => field.name === "accessToken")?.value;
            break;
        case "googleapis.gmail":
        case "googleapis.sheets":
            variableKey = formField.fields?.find(field => field.name === "oauthClientConfig")?.
                fields?.find(field => field.typeInfo.name === "OAuth2RefreshTokenGrantConfig")?.fields.find(field => field.name === "clientId")?.value;
            if (!variableKey) {
                variableKey = formField.fields?.find(field => field.name === "oauthClientConfig")?.
                    fields?.find(field => field.typeInfo.name === "BearerTokenConfig")?.fields.find(field => field.name === "token")?.value;
            }
            break;
        case "googleapis.calendar": {
            variableKey = formField.fields?.find(field => field.name === "oauth2Config")?.
                fields?.find(field => field.typeInfo.name === "OAuth2RefreshTokenGrantConfig")?.fields.find(field => field.name === "clientId")?.value;
            if (!variableKey) {
                variableKey = formField.fields?.find(field => field.name === "oauth2Config")?.
                    fields?.find(field => field.typeInfo.name === "BearerTokenConfig")?.fields.find(field => field.name === "token")?.value;
            }
            break;
        }
        default:
            return null;
    }

    allConnections.forEach(connection => {
        if (connection.codeVariableKeys.find(key => key.codeVariableKey === variableKey)) {
            activeConnection = connection;
        }
    });

    return activeConnection;
}

export function checkErrorsReturnType(action: string, functionDefinitions: Map<string, FunctionDefinitionInfo>): boolean {
    if (functionDefinitions.get(action)?.returnType?.isErrorType) {
        // return type has an error
        return true;
    }
    if (functionDefinitions.get(action)?.returnType?.typeInfo?.name === "Error") {
        // return type has an error
        return true;
    }
    if (functionDefinitions.get(action)?.returnType?.fields?.
        find((param: any) => (param?.isErrorType || param?.type === "error" || param?.typeInfo?.name === "Error"))) {
        // return type has an error
        return true;
    }
    // return type hasn't any error
    return false;
}

export function getFormattedModuleName(moduleName: string): string {
    let formattedModuleName = moduleName.includes('.') ? moduleName.split('.').pop() : moduleName;
    if (keywords.includes(formattedModuleName)) {
        formattedModuleName = `${formattedModuleName}0`;
    }
    return formattedModuleName;
}

export interface VariableNameValidationResponse {
    error: boolean;
    message?: string;
}
/**
 * check variable name validation with error message.
 * and return variableNameValidationResponse object.
 * @param varName text field name. this will used to generate error message
 * @param text current value of the text field
 * @param existingText default value. this will skip from variable list
 */
export function checkVariableName(varName: string, text: string, existingText?: string, symbolInfo?: STSymbolInfo): VariableNameValidationResponse {
    const lowerCasedAllVariables = retrieveVariables(symbolInfo).map(name => name.toLowerCase());
    const nameRegex = new RegExp("^'?[a-zA-Z][a-zA-Z0-9_]*$");
    let response: VariableNameValidationResponse = { error: false };
    if (text === "") {
        // is the name empty
        response = { error: true, message: `Name is empty` };
        return response;
    }
    if (text !== existingText && lowerCasedAllVariables?.includes(text.toLowerCase())) {
        // is already used in code
        response = { error: true, message: `${varName} already exists` };
        return response;
    }
    if (!nameRegex.test(text)) {
        // invalid format
        response = { error: true, message: `Invalid value for ${varName}` };
        return response;
    }
    if (keywords.includes(text)) {
        // is a keyword
        response = { error: true, message: `This is a reserved value. Please enter different value` };
        return response;
    }
    return response;
}
export function getManualConnectionDetailsFromFormFields(formFields: FormField[]): any {

    let selectedFields: any[] = []
    let configs: any
    let name: string
    let value: string

    if (formFields) {
        formFields.forEach(field => {
            if (field.isParam && !field.optional && !field.isReference) {
                switch (field.type) {
                    case "record":
                        configs = getManualConnectionDetailsFromFormFields(field.fields)
                        selectedFields = [...selectedFields, ...configs.selectedFields]
                        break;
                    case "union":
                        configs = getManualConnectionDetailsFromFormFields(field.fields)
                        selectedFields = [...selectedFields, ...configs.selectedFields]
                        break;

                    default:
                        if (field.value !== undefined) {
                            name = field.name
                            value = field.value
                            selectedFields.push({ name, value })
                        }
                }
            }
        });
    }
    return { selectedFields }
}
export function getManualConnectionTypeFromFormFields(formFields: FormField[]): any {
    const selectedType = (formFields[0]?.fields[0]?.selectedDataType) ? ((formFields[0]?.fields[0]?.selectedDataType)) : (formFields[0].selectedDataType)
    return selectedType
}
