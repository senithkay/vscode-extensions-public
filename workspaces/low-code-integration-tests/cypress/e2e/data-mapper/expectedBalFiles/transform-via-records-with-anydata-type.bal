
type Input record {
    string str;
    decimal dec;
    anydata inputField;
    anydata[] items1;
    record {
        string id;
        boolean confirmed;
    }[] items2;
};

type Output record {
    string str;
    anydata outputField1;
    anydata[] anydataItems1;
    record {
        string id;
        boolean confirmed;
        anydata outputField2;
    }[] items2;
    anydata outputField2;
    string[] stArr;
    anydata[] anydataItems2;
};

function transform(Input input) returns Output => {
    anydataItems1: from var items2Item in input.items2
        select {
            id: items2Item.id,
            qualified: items2Item.confirmed
        },
    stArr: [
        "",
        input.str
    ],
    items2: from var items1Item in input.items1
        select {
            id: "i1",
            confirmed: false,
            outputField2: {
                newlyAddedField: items1Item
            }
        },
    outputField2: {
        newlyAddedField: input.dec
    },
    anydataItems2: [
        {
            newlyAddedField: input.inputField
        }
    ],
    str: input.str,
    outputField1: 1.2
};
