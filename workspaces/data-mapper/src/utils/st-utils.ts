import { CaptureBindingPattern, LetExpression, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

export function isObject(item: unknown) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function genLetClauseVariableName(intermediateClauses: (STNode)[]): string {
    const baseName = 'variable';
    let index = 0;
    const allVariableNames: string[] = []

    for (const clause of intermediateClauses) {
        if (STKindChecker.isLetClause(clause)) {
            for (const item of clause.letVarDeclarations) {
                if (STKindChecker.isLetVarDecl(item)) {
                    allVariableNames.push(item.typedBindingPattern.bindingPattern.source.trim())
                }
            }
        }else if (STKindChecker.isJoinClause(clause)){
            allVariableNames.push((clause?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.value)
        }
    }
    while (allVariableNames.includes(`${baseName}${index ? index : ""}`)){
        index++;
    }

    return `${baseName}${index ? index : ""}`;
}

export function genLetExpressionVariableName(letExpressions: LetExpression[]): string {
    const baseName = 'variable';
    let varName = baseName;
    let index = 0;

    if (!letExpressions.some(expr => expr === undefined)) {
        for (const expr of letExpressions) {
            for (const decl of expr.letVarDeclarations) {
                if (STKindChecker.isLetVarDecl(decl) && decl.typedBindingPattern.bindingPattern.source.trim() === varName) {
                    index++;
                    varName = baseName + index.toString();
                }
            }
        }
    }
    return varName;
}
