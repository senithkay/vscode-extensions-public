import { FunctionType } from "../../resources/model";
import { GraphqlBaseLinkModel } from "../BaseLink/GraphqlBaseLinkModel";

export class GraphqlServiceLinkModel extends GraphqlBaseLinkModel {
    readonly functionType: FunctionType;

    constructor(functionType: FunctionType) {
        super('graphqlServiceLink');
        this.functionType = functionType;
    }
}
