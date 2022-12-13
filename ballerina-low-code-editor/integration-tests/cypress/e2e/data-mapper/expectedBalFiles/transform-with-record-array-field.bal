
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
    string[] stArr;
};

type UpdatedOutput record {
    string st1;
};

function unsupportedTransform(Input[]|error? input) returns Output? => {};

function incompleteTransform() => {};

function transform(Input input, SecondInput secondInput) returns Output => {
    Items: [
        {
            Id: input.st1,
            Confirmed: true
        }

    ]
};
