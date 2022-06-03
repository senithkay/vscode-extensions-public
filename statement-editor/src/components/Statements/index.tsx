/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { ActionStatementC } from "./ActionStatement";
import { AssignmentStatementComponent } from "./AssignmentStatement";
import { CallStatementC } from "./CallStatement";
import { ElseBlockC } from "./ElseIfStatement";
import { ForeachStatementC } from "./ForeachStatement";
import { IfStatementC } from "./IfStatement";
import { LocalVarDeclC } from './LocalVarDecl';
import { ModuleVarDeclC } from './ModuleVarDecl';
import { OtherStatementTypes } from "./OtherStatement";
import { ReturnStatementC } from "./ReturnStatement";
import { WhileStatementC } from "./WhileStatement";


export { LocalVarDeclC as LocalVarDecl };
export { ModuleVarDeclC as ModuleVarDecl };
export { WhileStatementC as WhileStatement };
export { ElseBlockC as ElseBlock };
export { ForeachStatementC as ForeachStatement };
export { IfStatementC as IfElseStatement };
export { OtherStatementTypes as OtherStatement };
export { ReturnStatementC as ReturnStatement };
export { CallStatementC as CallStatement };
export { AssignmentStatementComponent as AssignmentStatement };
export { ActionStatementC as ActionStatement };
