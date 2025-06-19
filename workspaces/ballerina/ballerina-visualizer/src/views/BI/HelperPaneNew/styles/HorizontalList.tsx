import styled from "@emotion/styled";

export const HorizontalListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

export const HorizontalListItem = styled.div`
    display: flex;
    gap: 3px;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px;
    &:hover {
        background-color:rgb(29, 29, 29);
        cursor: pointer;
    }
`;

export const HorizontalListItemLeftContent = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;