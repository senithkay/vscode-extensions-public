import { DraftInsertPosition } from "components/DiagramEditor";
import { LocalVarDecl } from "tools/syntax-tree/lib";

import { BallerinaConnectorsInfo } from "../../Definitions/lang-client-extended";

import { ViewState } from "./view-state";

export class PlusViewState extends ViewState {
    public visible: boolean = true;
    public collapsedPlusDuoExpanded: boolean = false;
    public expanded: boolean = false;
    public collapsedClicked: boolean = false;
    public index: number;
    public initialPlus: boolean = false;
    public draftAdded: string = undefined;
    public draftSubType: string = undefined;
    public draftConnector?: BallerinaConnectorsInfo;
    public draftSelectedConnector?: LocalVarDecl = undefined;
    public isLast: boolean = false;
    public selectedComponent: string;
    public isTriggerDropdown: boolean = false;
    public isAPICallsExisting: boolean = false;
    constructor() {
        super();
    }
}
