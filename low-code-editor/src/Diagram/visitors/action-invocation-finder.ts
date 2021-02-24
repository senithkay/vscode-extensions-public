import { RemoteMethodCallAction, Visitor } from "@ballerina/syntax-tree";

export class ActionInvocationFinder implements Visitor {
    public action: RemoteMethodCallAction = undefined;
    constructor() {
        this.action = undefined;
    }

    public beginVisitRemoteMethodCallAction(node: RemoteMethodCallAction) {
        this.action = node;
    }

    public getIsAction(): RemoteMethodCallAction {
        return this.action;
    }
}
