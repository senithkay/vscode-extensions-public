
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

type Output record {
    string st1;
    decimal d1?;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
    string[] stArr;
};

type User record {|
    readonly string id;
    string name;
|};

User[] users = [{id: "1234", name: "Keith"}];

function transform(Input input, SecondInput secondInput) returns Output => {};
