import {
    NodePosition
} from "@wso2-enterprise/syntax-tree";
export function isObject(item: unknown) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function containsWithin(
    filePath1: string,
    filePath2: string,
    position1: NodePosition,
    position2: NodePosition) {
    return (filePath1 === filePath2) &&
    (position1.startLine >= position2.startLine &&
        position1.endLine <= position2.endLine)
}
