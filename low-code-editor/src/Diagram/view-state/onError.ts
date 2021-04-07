import { StatementViewState } from ".";
import { SimpleBBox } from "./simple-bbox";

export class OnErrorViewState extends StatementViewState {
    public isFirstInFunctionBody: boolean = false;
    public lifeLine: SimpleBBox = new SimpleBBox();
    constructor() {
        super();
    }
}
