import React, { ReactNode } from 'react';
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ActionButtonsWrapper = styled.div`
    display: flex;
    gap: 10px;
`;

interface SectionHeaderProps {
    title: string;
    actionButtons?: ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionButtons }) => {
    return (
        <HeaderWrapper>
            <Typography sx={{ margin: 0 }} variant="h3">{title}</Typography>
            {actionButtons && (
                <ActionButtonsWrapper>
                    {actionButtons}
                </ActionButtonsWrapper>
            )}
        </HeaderWrapper>
    );
};

export default SectionHeader;
