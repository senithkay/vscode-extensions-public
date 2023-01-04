
type Input record {
    string st1;
    string st2;
    string st3;
    int int1;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
};

type SecondInput record {
    string st1;
};

type UpdatedInput record {
    string st1;
};

type Output record {
    string st1;
    decimal d1?;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
    InnerOutput[] innerOutput;
    string[] stArr;
};

type UpdatedOutput record {
    string st1;
};

type InnerOutput record {
    string st1;
    int i1;
};

function unsupportedTransform(Input[]|error? input) returns Output? => {};

function incompleteTransform() => {};

function transform(Input input, SecondInput secondInput) returns Output => {
    innerOutput: from var ItemsItem in input.Items
        where true
        let var updatedName = "strValue"
        select {
            st1: ItemsItem.Id + updatedName,
            i1:
        }
};
