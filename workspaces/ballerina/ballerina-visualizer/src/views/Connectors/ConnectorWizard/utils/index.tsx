import { BallerinaConnectorInfo, BallerinaModuleResponse, BallerinaConnectorsRequest, BallerinaConstruct, ConnectorParams, ConnectorRequest, getFormattedModuleName, getInitialSource, createObjectDeclaration, genVariableName, getAllVariables, createCheckObjectDeclaration, STSymbolInfo, FormField, FormFieldChecks, PrimitiveBalType, getFieldName } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { ModulePart, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

export async function fetchConnectorInfo(
    connector: BallerinaConstruct,
    langClient: BallerinaRpcClient,
    currentFilePath?: string
): Promise<BallerinaConnectorInfo> {
    let connectorInfo;
    const connectorRequest: ConnectorRequest = {};
    // Connector request with connector_id
    if (!connectorInfo && connector && connector.id) {
        connectorRequest.id = connector.id;
    }
    // Connector request with FQN
    if (!connectorInfo && connector && connector.moduleName && connector.package) {
        connectorRequest.name = connector.name;
        connectorRequest.moduleName = connector.moduleName;
        connectorRequest.orgName = connector.package.organization;
        connectorRequest.packageName = connector.package.name;
        connectorRequest.version = connector.package.version;
        connectorRequest.targetFile = currentFilePath;
    }
    if (!connectorInfo && connectorRequest) {
        const connectorResp = await langClient.getConnectorWizardRpcClient().getConnector(connectorRequest);
        if (connectorResp) {
            connectorInfo = connectorResp as BallerinaConnectorInfo;
        }
    }
    return connectorInfo;
}

export function getConnectorImports(syntaxTree: STNode, organization: string, moduleName: string, withExistingImports = false) {
    let isModuleImported = false;
    let isDriverImported = false;
    const imports = new Set<string>();

    if (STKindChecker.isModulePart(syntaxTree)) {
        (syntaxTree as ModulePart).imports?.forEach((imp: any) => {
            if (
                STKindChecker.isImportDeclaration(imp) &&
                imp.orgName?.orgName.value === organization &&
                imp.typeData?.symbol?.moduleID?.moduleName === `${moduleName}`
            ) {
                isModuleImported = true;
            }
            if (
                STKindChecker.isImportDeclaration(imp) &&
                imp.orgName?.orgName.value === organization &&
                imp.typeData?.symbol?.moduleID?.moduleName === `${moduleName}.driver`
            ) {
                isDriverImported = true;
            }
        });
        if (withExistingImports || !isModuleImported) {
            imports.add(`${organization}/${moduleName}`);
        }
        if (!isDriverImported && isDependOnDriver(moduleName)) {
            imports.add(`${organization}/${moduleName}.driver as _`);
        }
    }
    return imports;
}

export function isDependOnDriver(connectorModule: string): boolean {
    const dbConnectors = ["mysql", "mssql", "postgresql", "oracledb", "cdata.connect", "snowflake"]
    if (dbConnectors.includes(connectorModule)) {
        return true;
    }
    return false;
}

const EXPR_PLACEHOLDER = "EXPRESSION";

export async function getInitialSourceForConnectors(connector: BallerinaConnectorInfo, targetPosition: NodePosition, stSymbolInfo: STSymbolInfo): Promise<string> {
    return new Promise((resolve) => {
        const moduleName = getFormattedModuleName(connector.moduleName);
        // const parentWithError = isParentNodeWithErrorReturn(functionNode);
        // const isModuleVar = (!functionNode || isModuleType);
        let initialSource = "EXPRESSION";

        if (connector?.functions) {
            // Adding new endpoint
            const initFunction = (connector as BallerinaConnectorInfo).functions?.find((func) => func.name === "init");
            if (initFunction) {
                console.log("initFunction", initFunction);
                // const defaultParameters = getDefaultParams(initFunction.parameters);
                // const returnType = getFormFieldReturnType(initFunction.returnType);

                // initialSource = getInitialSource(
                //     (returnType?.hasError && (isModuleVar || parentWithError)) // INFO: New code actions will update parent function and `check` keyword
                //         ? createCheckObjectDeclaration(
                //               `${moduleName}:${connector.name}`,
                //               genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                //               defaultParameters,
                //               targetPosition
                //           )
                //         : createObjectDeclaration(
                //               `${moduleName}:${connector.name}`,
                //               genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                //               defaultParameters,
                //               targetPosition
                //           )
                // );
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

        resolve(initialSource);
    });
}

export function getDefaultParams(parameters: FormField[], depth = 1, valueOnly = false): string[] {
    if (!parameters) {
        return [];
    }
    const parameterList: string[] = [];
    parameters.forEach((parameter) => {
        if (parameter.defaultable || parameter.optional) {
            return;
        }
        let draftParameter = "";
        switch (parameter.typeName) {
            case PrimitiveBalType.String:
                draftParameter = getFieldValuePair(parameter, `""`, depth, valueOnly);
                break;
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Decimal:
                draftParameter = getFieldValuePair(parameter, `0`, depth, valueOnly);
                break;
            case PrimitiveBalType.Boolean:
                draftParameter = getFieldValuePair(parameter, `true`, depth, valueOnly);
                break;
            case PrimitiveBalType.Array:
                draftParameter = getFieldValuePair(parameter, `[]`, depth, valueOnly);
                break;
            case PrimitiveBalType.Xml:
                draftParameter = getFieldValuePair(parameter, "xml ``", depth, valueOnly);
                break;
            case PrimitiveBalType.Nil:
            case "anydata":
            case "()":
                draftParameter = getFieldValuePair(parameter, `()`, depth, true);
                break;
            case PrimitiveBalType.Json:
            case "map":
                draftParameter = getFieldValuePair(parameter, `{}`, depth, valueOnly);
                break;
            case PrimitiveBalType.Record:
                const allFieldsDefaultable = isAllDefaultableFields(parameter?.fields);
                if (!parameter.selected && allFieldsDefaultable && (parameter.optional || parameter.defaultValue)) {
                    break;
                }
                if (parameter.selected && allFieldsDefaultable && (parameter.optional || parameter.defaultValue) &&
                    !isAnyFieldSelected(parameter?.fields)) {
                    break;
                }
                const insideParamList = getDefaultParams(parameter.fields, depth + 1);
                draftParameter = getFieldValuePair(parameter, `{\n${insideParamList?.join()}}`, depth, valueOnly, false);
                break;
            case PrimitiveBalType.Enum:
            case PrimitiveBalType.Union:
                const selectedMember = getSelectedUnionMember(parameter);
                const selectedMemberParams = getDefaultParams([selectedMember], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, selectedMemberParams?.join(), depth, false, false);
                break;
            case "inclusion":
                if (isAllDefaultableFields(parameter.inclusionType?.fields) && !parameter.selected) {
                    break;
                }
                const inclusionParams = getDefaultParams([parameter.inclusionType], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, `${inclusionParams?.join()}`, depth);
                break;
            case "object":
                const typeInfo = parameter.typeInfo;
                if (
                    typeInfo &&
                    typeInfo.orgName === "ballerina" &&
                    typeInfo.moduleName === "sql" &&
                    typeInfo.name === "ParameterizedQuery"
                ) {
                    draftParameter = getFieldValuePair(parameter, "``", depth);
                }
                break;
            default:
                if (!parameter.name) {
                    // Handle Enum type
                    draftParameter = getFieldValuePair(parameter, `"${parameter.typeName}"`, depth, true);
                }
                if (parameter.name === "rowType") {
                    // Handle custom return type
                    draftParameter = getFieldValuePair(parameter, EXPR_PLACEHOLDER, depth);
                }
                break;
        }
        if (draftParameter !== "") {
            parameterList.push(draftParameter);
        }
    });
    return parameterList;
}

function getFieldValuePair(
    parameter: FormField,
    defaultValue: string,
    depth: number,
    valueOnly = false,
    useParamValue = true
): string {
    let value = defaultValue || EXPR_PLACEHOLDER;
    if (useParamValue && parameter.value) {
        value = parameter.value;
    }
    if (depth === 1 && !valueOnly) {
        // Handle named args
        return `${getFieldName(parameter.name)} = ${defaultValue}`;
    }
    if (depth > 1 && !valueOnly) {
        return `${getFieldName(parameter.name)}: ${defaultValue}`;
    }
    return defaultValue;
}

export function isAllDefaultableFields(recordFields: FormField[]): boolean {
    return recordFields?.every((field) => field.defaultable || (field.fields && isAllDefaultableFields(field.fields)));
}

export function isAnyFieldSelected(recordFields: FormField[]): boolean {
    return recordFields?.some((field) => field.selected || (field.fields && isAnyFieldSelected(field.fields)));
}

export function isAllIgnorable(fields: FormField[]): boolean {
    let result = true;
    fields?.forEach((field, key) => {
        if (!(field.optional || field.defaultable)) {
            result = false;
        }
    });
    return result;
}

export function isAllFieldsValid(allFieldChecks: Map<string, FormFieldChecks>, model: FormField | FormField[], isRoot: boolean): boolean {
    let result = true;
    let canModelIgnore = false;
    let allFieldsIgnorable = false;

    if (!isRoot) {
        const formField = model as FormField;
        canModelIgnore = formField.optional || formField.defaultable;
        allFieldsIgnorable = isAllIgnorable(formField.fields);
    } else {
        const formFields = model as FormField[];
        allFieldsIgnorable = isAllIgnorable(formFields);
    }

    allFieldChecks?.forEach(fieldChecks => {
        if (!canModelIgnore && !fieldChecks.canIgnore && (!fieldChecks.isValid || fieldChecks.isEmpty)) {
            result = false;
        }
        if (fieldChecks.canIgnore && !fieldChecks.isEmpty && !fieldChecks.isValid) {
            result = false;
        }
    });

    return result;
}

export function getUnionFormFieldName(field: FormField): string {
    return field.name || field.typeInfo?.name || field.typeName;
}

export function getSelectedUnionMember(unionFields: FormField): FormField {
    let selectedMember = unionFields.members?.find((member) => member.selected === true);
    if (!selectedMember) {
        selectedMember = unionFields.members?.find(
            (member) => getUnionFormFieldName(member) === unionFields.selectedDataType
        );
    }
    if (!selectedMember) {
        selectedMember = unionFields.members?.find(
            (member) => member.typeName === unionFields.value?.replace(/['"]+/g, "")
        );
    }
    if (!selectedMember && unionFields.members && unionFields.members.length > 0) {
        selectedMember = unionFields.members[0];
    }
    return selectedMember;
}