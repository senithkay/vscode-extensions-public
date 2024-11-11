/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import { TreeViewItem } from '../../../Treeview/TreeViewItem';
import { RightPathContainerButtons } from '../ComponentNavigator';
import styled from '@emotion/styled';

const SchemaItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 6px;
    width: 100%;
    padding: 2px 0;
    cursor: pointer;
    margin-left: 5px;
    margin-top: 5px;
    position: relative;
    &:hover div.buttons-container {
        opacity: 1;
    }
`;

interface PathTreeViewItemProps {
    id: string;
    schema: string;
    selectedComponent: string;
    onSelectedItemChange: (selectedItem: string) => void;
    onDeleteSchema: (schema: string) => void;
}

export function SchemaTreeViewItem(props: PathTreeViewItemProps) {
    const { id, schema, selectedComponent, onSelectedItemChange, onDeleteSchema } = props;

    const handleDeleteSchema = (e: React.MouseEvent, schema: string) => {
        e.stopPropagation();
        onDeleteSchema(schema);
    };

    return (
        <div onClick={() => onSelectedItemChange(`schemas-component-${schema}`)}>
            <TreeViewItem id={id} selectedId={selectedComponent}>
                <SchemaItemWrapper>
                    <Typography
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            margin: "0 0 0 2px",
                            fontWeight: 300
                        }}
                        variant="h4">
                        {schema}
                    </Typography>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Delete Schema" appearance="icon" onClick={(e) => handleDeleteSchema(e, schema)}><Codicon name="trash" /></Button>
                    </RightPathContainerButtons>
                </SchemaItemWrapper>
            </TreeViewItem>
        </div>
    )
}
