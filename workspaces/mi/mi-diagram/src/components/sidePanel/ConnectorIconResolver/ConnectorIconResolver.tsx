import styled from "@emotion/styled";
import React from "react";
import { ConnectorIcon } from "./ConnectorIcon";

const IconContainer = styled.div`
    position: relative;
    width: 35px;
    height: 35px;
`;

const BrandIcons = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    height= 35px;
    width= 35px;
`;

const CommonIcon = styled.div`
    position: absolute;
    top: 18px;
    left: 22px;
    z-index: 2;
    height= 12px;
    width= 12px
`;

export interface ConnectorIconResolverProps {
    iconUrl: string;
}



export function ConnectorIconResolver(props: ConnectorIconResolverProps) {
    const { iconUrl } = props;
    return (
        <IconContainer>
            <BrandIcons>
                <img height="35px" width="35px" src={iconUrl} alt="Connector" />
            </BrandIcons>
            <CommonIcon>
                <ConnectorIcon />
            </CommonIcon>
        </IconContainer>
    );
}
