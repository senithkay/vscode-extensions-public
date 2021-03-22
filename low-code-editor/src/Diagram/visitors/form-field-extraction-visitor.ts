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

import {
    ArrayTypeDesc,
    BooleanTypeDesc,
    ClassDefinition,
    DefaultableParam,
    ErrorTypeDesc,
    FloatTypeDesc,
    IntTypeDesc,
    JsonTypeDesc,
    MarkdownParameterDocumentationLine,
    NilTypeDesc,
    ObjectMethodDefinition,
    OptionalTypeDesc,
    ParenthesisedTypeDesc,
    QualifiedNameReference,
    RecordField,
    RecordFieldWithDefaultValue,
    RecordTypeDesc,
    RequiredParam,
    SimpleNameReference,
    STNode,
    StringTypeDesc,
    traversNode,
    TypeDefinition,
    TypeReference,
    UnionTypeDesc,
    VarTypeDesc,
    Visitor,
    XmlTypeDesc
} from "@ballerina/syntax-tree";

// import { BallerinaLangClient } from "../../../../api/lang-client";
import { FormField, FunctionDefinitionInfo, PrimitiveBalType } from "../../ConfigurationSpec/types";

export const functionDefinitionMap: Map<string, FunctionDefinitionInfo> = new Map();
const records: Map<string, STNode> = new Map();

class FieldVisitor implements Visitor {
    // langClient: BallerinaLangClient;

    beginVisitClassDefinition(node: ClassDefinition) {
        Object.keys(node.typeData.records).forEach(key => {
            records.set(key, node.typeData.records[key])
        });
    }

    /**
     * visits any type of parameter optional/required
     * @param node
     */
    beginVisitRequiredParam(node: RequiredParam) {
        const viewState: FormField = node.viewState as FormField;
        if (node.viewState && node.typeName) {
            viewState.name = node.paramName.value;
            node.typeName.viewState = viewState;
        }

    }

    /**
     * visits parameter nodes with default value
     * @param node
     */
    beginVisitDefaultableParam(node: DefaultableParam) {
        const viewState: FormField = node.viewState as FormField;
        if (node.viewState && node.typeName) {
            viewState.name = node.paramName.value;
            viewState.typeName = undefined;
            node.typeName.viewState = viewState;
            viewState.optional = true;
        }
    }

    beginVisitVarTypeDesc(node: VarTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.type = PrimitiveBalType.Var;
        }
    }

    beginVisitStringTypeDesc(node: StringTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.type = PrimitiveBalType.String;
        }
    }

    beginVisitIntTypeDesc(node: IntTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.type = PrimitiveBalType.Int;
        }
    }

    beginVisitFloatTypeDesc(node: FloatTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.type = PrimitiveBalType.Float;
        }
    }

    beginVisitBooleanTypeDesc(node: BooleanTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.type = PrimitiveBalType.Boolean;
        }
    }

    beginVisitNilTypeDesc(node: NilTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.type = PrimitiveBalType.Nil;
        }
    }


    beginVisitJsonTypeDesc(node: JsonTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.type = PrimitiveBalType.Json
        }
    }

    beginVisitXmlTypeDesc(node: XmlTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.type = PrimitiveBalType.Xml
        }
    }

    beginVisitArrayTypeDesc(node: ArrayTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField | any = node.viewState as FormField;
            viewState.isArray = true;
            viewState.type = PrimitiveBalType.Collection;

            switch (node.memberTypeDesc.kind) {
                case 'StringTypeDesc':
                    viewState.collectionDataType = PrimitiveBalType.String;
                    break;
                case 'IntTypeDesc':
                    viewState.collectionDataType = PrimitiveBalType.Int
                    break;
                case 'FloatTypeDesc':
                    viewState.collectionDataType = PrimitiveBalType.Float
                    break;
                case 'UnionTypeDesc':
                    const fieldViewState: FormField = {
                        isParam: viewState.isParam,
                        isArray: true,
                        type: PrimitiveBalType.Union
                    }

                    viewState.fields.push(fieldViewState);
                    break;
            }
        }
    }

    beginVisitUnionTypeDesc(node: UnionTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.isUnion = true;
            viewState.type = PrimitiveBalType.Union
            viewState.fields = viewState?.fields?.length > 0 ? viewState.fields : [];

            node.leftTypeDesc.viewState = { isParam: true, type: undefined };
            node.rightTypeDesc.viewState = { isParam: true, type: undefined };
        }
    }

    beginVisitParenthesisedTypeDesc(node: ParenthesisedTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            node.typedesc.viewState = node.viewState;
        }
    }

    endVisitUnionTypeDesc(node: UnionTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;

            viewState.fields.push(node.leftTypeDesc.viewState);
            if (node.rightTypeDesc && node.rightTypeDesc.kind === 'UnionTypeDesc') {
                viewState.fields = [...viewState.fields, ...node.rightTypeDesc.viewState.fields];
            } else {
                viewState.fields.push(node.rightTypeDesc.viewState);
            }
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.viewState && node.viewState.isParam) {
            const typeData = node.typeData;
            const viewState: FormField = node.viewState;

            if (typeData.typeSymbol) {
                const typeSymbol = typeData.typeSymbol;
                const typeDef: TypeDefinition = records.get(typeSymbol.signature) as TypeDefinition;

                if (typeDef && typeSymbol.typeKind === 'typeReference') {
                    viewState.fields = [];
                    const typeDesc: RecordTypeDesc = typeDef.typeDescriptor as RecordTypeDesc;

                    if (typeDesc.kind === 'RecordTypeDesc') {
                        viewState.type = PrimitiveBalType.Record

                        viewState.typeName = typeDef.typeName.value;
                        viewState.typeInfo = {
                            modName: typeDesc.typeData.typeSymbol.moduleID.moduleName,
                            name: typeDesc.typeData.typeSymbol.name,
                            orgName: typeDesc.typeData.typeSymbol.moduleID.orgName,
                            version: typeDesc.typeData.typeSymbol.moduleID.version
                        }

                        typeDesc.fields.forEach(field => {
                            const typeNameNode = field.typeName;
                            const typeNameVS: FormField = {
                                name: field.kind === 'TypeReference' ? field.typeData.typeSymbol.name
                                    : field.fieldName.value,
                                isParam: true,
                                type: PrimitiveBalType.Record
                            }
                            typeNameNode.viewState = typeNameVS;
                            traversNode(typeNameNode, this);
                            viewState.fields.push(typeNameVS);
                        })

                    }
                } else if (typeSymbol.typeKind === 'union') {
                    viewState.type = PrimitiveBalType.Union
                    viewState.isUnion = true;
                    viewState.fields = [];

                    viewState.typeName = node.name.value;
                    if (typeSymbol.moduleID) {
                        viewState.typeInfo = {
                            modName: typeSymbol.moduleID.moduleName,
                            name: node.name.value,
                            orgName: typeSymbol.moduleID.orgName,
                            version: typeSymbol.moduleID.version
                        };
                    }

                    if (typeSymbol.members) {
                        typeSymbol.members.forEach((element: any) => {
                            element.viewState = {
                                type: element.typeKind,
                                isParam: true
                            }

                            if (element.moduleID) {
                                element.viewState.typeInfo = {
                                    modName: element.moduleID.moduleName,
                                    name: element.name,
                                    orgName: element.moduleID.orgName,
                                    version: element.moduleID.version
                                }
                            }

                            viewState.fields.push(element.viewState);
                        });
                    }
                    // typeSymbol.signature.split('|').forEach((element: string) => {
                    //     const fieldProperty: FormField = {
                    //         type: element as balTypes,
                    //         isParam: true,
                    //     };

                    //     if (element.endsWith('[]')) {
                    //         const regExp = /(,*)\[]$/g;
                    //         fieldProperty.collectionDataType = element.match(regExp)[1] as balTypes;
                    //         fieldProperty.type = 'collection' as balTypes;
                    //         fieldProperty.isArray = true;
                    //     }

                    //     this.addFieldToUnion(
                    //         fieldProperty.isArray ? fieldProperty.collectionDataType : fieldProperty.type,
                    //         fieldProperty,
                    //         viewState
                    //     );
                    // });
                } else {
                    viewState.typeName = node.name.value;
                    if (node.typeData.typeSymbol.kind !== 'CONSTANT' && typeSymbol.moduleID) {
                        viewState.typeInfo = {
                            modName: typeSymbol.moduleID.moduleName,
                            name: node.name.value,
                            orgName: typeSymbol.moduleID.orgName,
                            version: typeSymbol.moduleID.version
                        };
                    }
                }
            }
        }
    }

    // private addFieldToUnion(type: balTypes, fieldVS: FormField, viewState: FormField) {
    //     switch (type) {
    //         case "boolean":
    //         case "float":
    //         case "string":
    //         case "int":
    //         case "json":
    //         case "xml":
    //             viewState.fields.push(fieldVS);
    //             break;
    //         default:
    //         // ignored types atm
    //     }
    // }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.type = PrimitiveBalType.Record
            if (node.fields) {
                node.fields.forEach((field, i) => {
                    field.viewState = {
                        isParam: viewState.isParam,
                    }
                })
            }
        }
    }

    beginVisitRecordFieldWithDefaultValue(node: RecordFieldWithDefaultValue) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.name = node.fieldName.value;
            node.typeName.viewState = node.viewState;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.name = node.fieldName.value;
            viewState.optional = node.questionMarkToken ? true : false;
            node.typeName.viewState = node.viewState;
        }
    }

    endVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState as FormField;
            viewState.fields = [];
            if (node.fields) {
                node.fields.forEach(field => {
                    viewState.fields.push(field.viewState);
                });
            }
        }
    }

    beginVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
        node.functionSignature.parameters
            .filter(param => param.kind !== 'CommaToken')
            .forEach(param => {
                param.viewState = {
                    isParam: true
                }
            });

        if (node.functionSignature.returnTypeDesc) {
            const returnType = node.functionSignature.returnTypeDesc.type.viewState = {
                isParam: true
            };
        }
    }



    endVisitObjectMethodDefinition(node: ObjectMethodDefinition) {
        const functionQualifierList: string[] = node.qualifierList.map(qualifier => qualifier.kind);
        if (!(functionQualifierList.indexOf('PrivateKeyword') > -1)) {
            const parameterDescriptions: Map<string, string> = new Map<string, string>();

            if (node.metadata) {
                node.metadata.documentationString.documentationLines
                    .filter(docLine => docLine.kind === 'MarkdownParameterDocumentationLine')
                    .forEach((paramDesc: MarkdownParameterDocumentationLine) => {
                        /* todo : need to remove the parametername from the documentation description
                         document elements(paramDesc.documentElements) are in an array form need to check
                         how it appears for multiline comments */
                        parameterDescriptions.set(paramDesc.parameterName.value, paramDesc.source.trim());
                    });
            }

            functionDefinitionMap.set(node.functionName.value, { parameters: [], returnType: undefined });

            if (node.functionSignature.parameters.length > 0) {
                node.functionSignature.parameters
                    .filter(paramElement =>
                        (paramElement.kind === 'RequiredParam' || paramElement.kind === 'DefaultableParam'))
                    .forEach((paramElement: RequiredParam | DefaultableParam) => {
                        const params = functionDefinitionMap.get(node.functionName.value).parameters;
                        paramElement.viewState.description = parameterDescriptions.get(paramElement.paramName.value);
                        params.push(paramElement.viewState);
                    });
            }

            if (node.functionSignature.returnTypeDesc) {
                functionDefinitionMap.get(node.functionName.value).returnType
                    = node.functionSignature.returnTypeDesc.type.viewState;
            }
        }
    }

    beginVisitQualifiedNameReference(node: QualifiedNameReference) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            const typeSymbol = node.typeData.typeSymbol;

            viewState.typeInfo = {
                // todo: sometimes the typesymbol.name is an empty string need to look into it more
                name: typeSymbol.name !== '' ? typeSymbol.name : node.identifier.value,
                modName: typeSymbol.moduleID.moduleName,
                orgName: typeSymbol.moduleID.orgName,
                version: typeSymbol.moduleID.version
            }
        }
    }


    beginVisitTypeDefinition(node: TypeDefinition) {
        if (node.viewState && node.viewState.isParam) {
            node.typeDescriptor.viewState = node.viewState;
        }
    }

    // todo: change the node type once the syntax-tree update is ready
    beginVisitDistinctTypeDesc(node: any) {
        if (node.viewState && node.viewState.isParam) {
            node.typeDescriptor.viewState = node.viewState;
        }
    }

    beginVisitErrorTypeDesc(node: ErrorTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            node.viewState.isErrorType = true;
        }
    }

    beginVisitTypeReference(node: TypeReference) {
        if (node.viewState && node.viewState.isParam) {
            const typeSymbol = node.typeName.typeData.typeSymbol;
            const typeRefVS: FormField = node.viewState;
            typeRefVS.isReference = true;

            typeRefVS.typeInfo = {
                name: typeSymbol.name,
                modName: typeSymbol.moduleID.moduleName,
                orgName: typeSymbol.moduleID.orgName,
                version: typeSymbol.moduleID.version
            }
        }
    }

    beginVisitOptionalTypeDesc(node: OptionalTypeDesc) {
        if (node.viewState && node.viewState.isParam) {
            const viewState: FormField = node.viewState;
            viewState.optional = true;
            node.typeDescriptor.viewState = viewState;
        }
    }

}

export function cleanFields() {
    functionDefinitionMap.clear();
}

export const visitor = new FieldVisitor();
