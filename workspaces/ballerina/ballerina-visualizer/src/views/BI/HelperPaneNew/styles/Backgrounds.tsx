import styled from "@emotion/styled";


export const HelperBackground = styled.div`
  background:rgb(41, 41, 41);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  height: 100%;
  font-size: 16px;
`;

export const HorizontalListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

export const HorizontalListItem = styled.div`
    display: flex;
    gap: 3px;
    padding: 10px 20px;
    &:hover {
        background-color:rgb(29, 29, 29);
        cursor: pointer;
    }
`;