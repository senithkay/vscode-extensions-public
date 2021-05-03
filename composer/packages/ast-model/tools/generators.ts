export function genInterfacesFileCode(modelInfo: any) {
    const modelNames = Object.keys(modelInfo).sort();
    const interfaces = modelNames.map((key) => {
        return `export ${genInterfaceCode(key, modelInfo[key])}`;
    });

    return `
        // This is an auto-generated file. Do not edit.
        // Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-ast-utils' to generate.
        // tslint:disable:ban-types
        export interface NodePosition {
            endColumn: number;
            endLine: number;
            startColumn: number;
            startLine: number;
        }
        export interface ASTNode {
            id: string;
            kind: string;
            viewState?: any;
            ws?: any[];
            position?: NodePosition;
            parent?: ASTNode;
        }

        ${interfaces.join("\n")}
        // tslint:enable:ban-types
    `;
}

export function genBaseVisitorFileCode(modelNames: string[]) {
    const visitFunctions = modelNames.map((key) => {
        return genVisitFunctionCode(key);
    });

    return `
        // This is an auto-generated file. Do not edit.
        // Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-ast-utils' to generate.
        import * as Ballerina from "./ast-interfaces";

        export interface Visitor {
            beginVisitASTNode?(node: Ballerina.ASTNode, parent?: Ballerina.ASTNode): void;
            endVisitASTNode?(node: Ballerina.ASTNode, parent?: Ballerina.ASTNode): void;

            ${visitFunctions.join("\n")}
        }
    `;
}

export function genCheckKindUtilCode(modelNames: string[]) {
    const kindChecks = modelNames.map((key) => {
        return genCheckKindFunctionCode(key);
    });

    return `
        // This is an auto-generated file. Do not edit.
        // Run 'BALLERINA_HOME="your/ballerina/home" npm run gen-ast-utils' to generate.
        import * as Ballerina from "./ast-interfaces";

        export class ASTKindChecker {
            ${kindChecks.join("\n")}
        }
    `;
}

export function findModelInfo(node: any, modelInfo: any = {}) {
    if (!modelInfo[node.kind]) {
        modelInfo[node.kind] = {
            __count: 0,
        };
    }
    const model = modelInfo[node.kind];
    model.__count++;

    Object.keys(node).forEach((key) => {
        if (["kind", "id", "position"].includes(key)) {
            // These properties are in the interface ASTNode
            // Other interfaces we generate extends it, so no need to add it.
            return;
        }

        const value = (node as any)[key];

        if (model[key] === undefined) {
            model[key] = {
                __count: 0,
                type: {},
            };
        }
        const property = model[key];
        property.__count++;

        if (value.kind) {
            property.type[value.kind] = true;
            findModelInfo(value, modelInfo);
            return;
        }

        if (Array.isArray(value)) {
            const types: any = {};
            value.forEach((valueEl) => {
                if (valueEl.kind) {
                    types[valueEl.kind] = true;
                    findModelInfo(valueEl, modelInfo);
                    return;
                }

                if (["boolean", "string", "number"].includes(typeof valueEl)) {
                    types[typeof valueEl] = true;
                } else {
                    types.any = true;
                }
            });
            if (property.elementTypes) {
                Object.assign(types, property.elementTypes);
            }
            property.elementTypes = types;
            return;
        }

        if (["boolean", "string", "number"].includes(typeof value)) {
            property.type[typeof value] = true;
        } else {
            property.type.any = true;
        }
    });

    return modelInfo;
}

function genInterfaceCode(kind: string, model: any) {
    return `
        interface ${kind} extends ASTNode {
            ${getPropertyCode(model).join("\n            ")}
        }
    `;
}

function getPropertyCode(model: any) {
    const code: any[] = [];

    Object.keys(model).sort().forEach((key) => {
        if (key.startsWith("__")) {
            return;
        }

        const property = model[key];

        let type = "any";
        const typesFound: any = Object.keys(property.type).sort();
        if (typesFound.length > 0) {
            type = typesFound.join("|");
        }

        if (property.elementTypes) {
            const elementTypesFound: any = Object.keys(property.elementTypes).sort();
            if (elementTypesFound.length > 1) {
                type = `Array<${elementTypesFound.join("|")}>`;
            } else if (elementTypesFound.length === 1) {
                type = `${elementTypesFound[0]}[]`;
            }
        }

        const optional = model.__count > property.__count ? "?" : "";
        code.push(`${key}${optional}: ${type};`);
    });

    return code;
}

function genVisitFunctionCode(nodeKind: string) {
    return `
        beginVisit${nodeKind}?(node: Ballerina.${nodeKind}, parent?: Ballerina.ASTNode): void;
        endVisit${nodeKind}?(node: Ballerina.${nodeKind}, parent?: Ballerina.ASTNode): void;
    `;
}

function genCheckKindFunctionCode(nodeKind: string) {
    return `
        public static is${nodeKind}(node: Ballerina.ASTNode): node is Ballerina.${nodeKind} {
            return node.kind === "${nodeKind}";
        }
    `;
}
