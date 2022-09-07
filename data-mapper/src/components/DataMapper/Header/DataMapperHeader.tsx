import React from "react";
import styled from "@emotion/styled";
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';

export function DataMapperHeader(props: { name: string; onClose: () => void; onCofingOpen: () => void; }) {
    const { name, onClose, onCofingOpen } = props;
    return <HeaderContainer>
        <HomeButton onClick={onClose} />
        <Title>Data Mapper: {name}</Title>
        <SettingsButton onClick={onCofingOpen} />
    </HeaderContainer>
}

const HeaderContainer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    padding: 15px;
    background-color: white;
    justify-content: space-between;
`;


const HomeButton = styled(HomeIcon)`
    cursor: pointer;
`;

const SettingsButton = styled(SettingsIcon)`
    cursor: pointer;
`;

const Title = styled.div`
    font-weight: 600;
`;

const Name = styled.div`
    font-weight: 400;
`;