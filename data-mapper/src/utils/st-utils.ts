import { NodePosition } from "@wso2-enterprise/syntax-tree";

export function isObject (item: any) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}
