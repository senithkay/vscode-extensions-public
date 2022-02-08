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
import { BlockStatement, FunctionBodyBlock, FunctionDefinition, NamedWorkerDeclarator, STKindChecker, STNode, Visitor } from '@wso2-enterprise/syntax-tree';
import { STOP_SVG_HEIGHT } from '../Components/RenderingComponents/End/StopSVG';
import { BlockViewState, FunctionViewState, StatementViewState } from '../ViewState';

class WorkerSyncVisitor implements Visitor {

    public beginVisitFunctionBodyBlock(node: FunctionBodyBlock) {
        this.beginVisitBlockStatement(node);
    }

    public beginVisitBlockStatement(node: BlockStatement) {
        const viewState: BlockViewState = node.viewState as BlockViewState;
        let height = viewState.bBox.cy;

        console.log('>>> block info', viewState.bBox.cy, node);
        node.statements.forEach(statement => {
            const statementVS: StatementViewState = statement.viewState as StatementViewState;
            console.log('>>> statement info', statementVS);

            if ((STKindChecker.isActionStatement(statement) && statement.expression.kind === 'AsyncSendAction')
                && (STKindChecker.isLocalVarDecl(statement) && statement.initializer?.kind === 'ReceiveAction')) {
                height += (statementVS.bBox.cy - height);
            } else {
                if (statementVS.bBox.cy < height) {
                    statementVS.bBox.cy = height + statementVS.bBox.h;
                    height += statementVS.bBox.h;
                } else {
                    height += (statementVS.bBox.cy - height);
                }
            }
        });

        viewState.bBox.h = height;
        
    }

    public endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        const functionVS: FunctionViewState = node.viewState as FunctionViewState;
        const functionBodyVS = node.functionBody.viewState as BlockViewState;

        functionVS.workerLine.h = functionBodyVS.bBox.h;
        functionBodyVS.bBox.h = functionBodyVS.bBox.h;
        functionVS.end.bBox.cy = functionBodyVS.bBox.cy + functionBodyVS.bBox.h - STOP_SVG_HEIGHT;
    }
}

export const workerSyncVisitor = new WorkerSyncVisitor();
