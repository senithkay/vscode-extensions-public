import styled from "@emotion/styled";

import { Colors } from "../model";


export const FieldType = styled.span`
    background-color: ${Colors.SECONDARY};
    border-radius: 3px;
    color: #000000;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 24px;
    line-height: 24px;
    min-width: 60px;
    padding-inline: 6px;
    text-align: center;
`;

export const FieldName = styled.span`
    align-items: center;
    color: #000000;
    display: flex;
    flex: 1;
    font-family: GilmerRegular;
    font-size: 12px;
    line-height: 30px;
    padding-right: 8px;
    text-align: left;
`;

export const HeaderName = styled.span`
    margin-left: 8px;
`;

export const NodeHeader = styled.div`
    align-items: center;
    border-bottom: ${`1px solid ${Colors.PRIMARY}`};
    display: flex;
    font-family: GilmerRegular;
    font-size: 13px;
    height: 32px;
    justify-content: center;
    line-height: 24px;
    padding-inline: 8px;
    min-width: calc(100% - 16px);
    text-align: center;
    white-space: nowrap;
`;

export const NodeFieldContainer = styled.div`
    align-items: center;
    background-color: #FFFFFF;
    border-bottom: 0.5px solid #cccde3;
    color: #000000;
    display: flex;
    flex-direction: row;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 30px;
    justify-content: center;
    line-height: 16px;
    min-width: calc(100% - 16px);
    padding: 8px 8px 8px 8px;
    text-align: center;
`;
