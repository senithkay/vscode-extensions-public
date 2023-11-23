/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import React from "react";
import { ComponentViewInfo } from "./ComponentListView";
import { ComponentCard, Icon, Typography } from "@wso2-enterprise/ui-toolkit";
// import styled from "@emotion/styled";

interface ComponentViewProps {
    type?: string;
    info: ComponentViewInfo;
    updateSelection: (info: ComponentViewInfo) => void;
}


export function ComponentView(props: ComponentViewProps) {
    const { info, type, updateSelection } = props;

    const handleComponentClick = () => {
        updateSelection(info);
    };

    const isComponentAllowed = () => {
        switch (type) {
            case 'classes':
            case 'objects':
            case 'types':
            case 'enums':
            case 'listeners':
                return false;
            default:
                return true;
        }
    }

    // const ComponentContainer = styled.div`
    //     width: 120px;
    //     display: flex;
    //     flex-direction: row;
    //     border: 1px solid #ccc; /* Add a border with a color of your choice */
    //     border-radius: 5px; /* Adjust the border-radius to your preferred value */
    //     padding: 10px; /* Add padding for better visual appearance, adjust as needed */
    // `;

    return (
        // <ComponentContainer
        //     onClick={isComponentAllowed(props.type) ? handleComponentClick : undefined}
        //     title={info.name.length ? info.name : '/'}
        // >
        //     <div className="icon">
        //        Icon XX
        //     </div>
        //     <h2>
        //         {info.name.length ? info.name : '/'}
        //     </h2>
        // </ComponentContainer>

        <ComponentCard
            id="Test"
            onClick={isComponentAllowed() ? handleComponentClick : undefined}
            sx={{
                '&:hover, &.active': {
                    '.icon svg g': {
                        fill: 'var(--vscode-editor-foreground)'
                    },
                    backgroundColor: 'var(--vscode-pickerGroup-border)',
                    border: '1px solid var(--vscode-focusBorder)'
                },
                alignItems: 'center',
                border: '1px solid var(--vscode-editor-foreground)',
                borderRadius: 5,
                cursor: isComponentAllowed() ? 'cursor' : 'not-allowed',
                display: 'flex',
                height: 50,
                justifyContent: 'left',
                marginBottom: 16,
                marginRight: 16,
                padding: 10,
                transition: '0.3s',
                width: 200
            }}
        >
            <Icon name="ballerina" />
            <Typography variant="h3">
                {info.name.length ? info.name : '/'}
            </Typography>
        </ComponentCard>
    )
}

// function iconNameTranslator(type: string) {
//     switch (type) {
//         case 'functions':
//             return 'Function';
//         case 'services':
//             return 'Service';
//         case 'records':
//             return 'TypeDefinition';
//         case 'objects':
//             return 'Object';
//         case 'classes':
//             return 'Class';
//         case 'types':
//             return 'TypeDefinition';
//         case 'constants':
//             return 'Constant';
//         case 'enums':
//             return 'Enum';
//         case 'listeners':
//             return 'Listener';
//         case 'moduleVariables':
//             return 'Variable';
//         default:
//             return 'TypeDefinition';
//     }
// }

