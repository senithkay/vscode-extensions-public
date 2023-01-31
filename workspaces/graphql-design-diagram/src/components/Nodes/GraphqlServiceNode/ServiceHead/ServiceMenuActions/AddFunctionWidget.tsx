// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
import React, { useContext, useState } from "react";

import { IconButton, Tooltip } from "@material-ui/core";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { MutationIcon } from "../../../../resources/assets/icons/MutationIcon";
import { QueryIcon } from "../../../../resources/assets/icons/QueryIcon";
import { SubscriptionIcon } from "../../../../resources/assets/icons/SubscriptionIcon";
import { FunctionType, Position } from "../../../../resources/model";

interface AddFunctionWidgetProps {
    position: Position;
    functionType: FunctionType;
}

export function AddFunctionWidget(props: AddFunctionWidgetProps) {
    const { position, functionType } = props;
    // const {functionPanel } = useContext(DiagramContext)

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const openFunctionPanel = () => {
        if (position) {
            const nodePosition : NodePosition = {
                startLine: position.startLine.line,
                startColumn: position.startLine.offset,
                endLine: position.endLine.line,
                endColumn: position.endLine.offset
            }
            // TODO: enable form rendering functionality
            // functionPanel(nodePosition, "ResourceForm");
        }
    };

    const popupTitle = () => {
        if (functionType === FunctionType.QUERY){
            return "Add Query";
        } else if (functionType === FunctionType.MUTATION){
            return "Add Mutation";
        } else {
            return "Add Subscription";
        }
    }

    const popupIcon = () => {
        if (functionType === FunctionType.QUERY){
            return <QueryIcon/>;
        } else if (functionType === FunctionType.MUTATION){
            return <MutationIcon/>;
        } else {
            return <SubscriptionIcon/>;
        }
    }

    return (
        <>
            {position &&
            // tslint:disable-next-line:jsx-wrap-multiline
                <>
                    <Tooltip
                        open={isHovered}
                        title={popupTitle()}
                        arrow={true}
                        placement="right"
                    >
                        <IconButton
                            onClick={() => openFunctionPanel()}
                            onMouseOver={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{
                                backgroundColor: isHovered ? '#ffaf4d' : '',
                                borderRadius: '50%',
                                color: isHovered ? 'whitesmoke' : '#ffaf4d',
                                cursor: 'pointer',
                                fontSize: '22px',
                                padding: '2px'
                            }}
                        >
                            {popupIcon()}
                        </IconButton>
                    </Tooltip>
                </>
            }
        </>
    );
}
