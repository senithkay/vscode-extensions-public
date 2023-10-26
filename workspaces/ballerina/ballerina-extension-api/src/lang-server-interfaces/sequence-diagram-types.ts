/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { LinePosition } from "./basic-lang-server-types";

export interface DNode {
    kind: string;
    isHidden: boolean;
    location: Location;
}

export interface Location {
    fileName: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

export interface DElement extends DNode {
    elementBody: DElementBody;
}

export interface DElementBody extends DNode {
    childElements: DNode[];
}

export interface Participant extends DElement {
    id: string;
    name: string;
    participantKind: PariticipantKind;
    packageName: string;
    type: string;
}

export type PariticipantKind = 'WORKER' | 'ENDPOINT';

export interface SequenceModel extends DNode {
    participants: Participant[];
}

export interface Interaction extends DNode {
    sourceId: string;
    targetId: string;
    interactionType: string;
}

export interface FunctionActionStatement extends Interaction {
    functionName: string;
}

export interface EndpointActionStatement extends Interaction {
    actionName: string;
    actionPath: string;
    methodName: string;
    actionType: ActionType;
}

export type ActionType = "RESOURCE_ACTION" | "REMOTE_ACTION"

export interface DoStatement extends DElement {
    onFailStatement: OnFailStatement;
}

export interface OnFailStatement extends DElement {
    type: string;
    name: string;
}

export interface WhileStatement extends DElement {
    condition: string;
    onFailStatement: OnFailStatement;
}

export interface IfStatement extends DElement {
    condition: string;
    elseStatement: DElement;
}

export interface LockStatement extends DElement {
    onFailStatement: OnFailStatement;
}

export interface ForeachStatement extends DElement {
    collection: string;
    onFailStatement: OnFailStatement;
}
