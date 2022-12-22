
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
    InnerOutput[] innerOutput;
    string[] stArr;
};

type User record {|
    readonly string id;
    string name;
|};

User[] users = [{id: "1234", name: "Keith"}];

type InnerOutput record {
    string st1;
    int i1;
};

function transform(Input input, SecondInput secondInput) returns Output => {
    Items: from var ItemsItem in input.Items
        where true
        let var updatedName = "strValue"
        limit 10
        order by ItemsItem.Id ascending
        join var variable in users on ItemsItem.Id equals variable.id
        select {
            Id: ItemsItem.Id + updatedName + variable.id,
            Confirmed:
        }
};
