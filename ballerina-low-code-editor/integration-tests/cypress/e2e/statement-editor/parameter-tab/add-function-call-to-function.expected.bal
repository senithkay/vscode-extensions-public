type Person record {
    string name = "";
};

type Student record {
    *Person;
    string school?;
};

function emptyFun() returns int? {
    return 0;
}

function fooFun(string str, int n = 0, Student student = {}) returns string {
    return str;
}

public function main() returns error? {

    var fun = emptyFun();
    var variable = fooFun("str", 0);
}
