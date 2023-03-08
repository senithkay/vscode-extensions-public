import {
    StringLiteral,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";
import { Range } from "vscode";
import { newLine } from "./split-provider";

export class SplitProviderVisitor implements Visitor {
    range: Range;
    validSplit: boolean = false;

    constructor(range: Range) {
        this.range = range;
    }

    public beginVisitStringLiteral(node: StringLiteral, parent?: STNode) {
        if (node.position.startLine === this.range.start.line && node.position.startColumn <= this.range.start.character &&
            node.position.endLine === this.range.end.line && node.position.endColumn >= this.range.end.character) {
            if (node.position.endColumn === this.range.end.character &&
                (node.source.startsWith(`"${newLine}`) || !node.source.endsWith(`"${newLine}`))) {
                this.validSplit = true;
            }
        }
    }

    public isValidSplit(): boolean {
        return this.validSplit;
    }
}
