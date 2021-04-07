import { SimpleBBox, StatementViewState } from ".";

export class DoViewState extends StatementViewState {
    public isFirstInFunctionBody: boolean = false;
    public container:SimpleBBox = new SimpleBBox();
    constructor() {
        super();
    }
}
