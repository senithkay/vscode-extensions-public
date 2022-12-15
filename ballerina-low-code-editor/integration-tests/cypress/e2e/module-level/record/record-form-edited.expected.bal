type Individual record {
    string firstName;
    int age;
    record {
        string city;
        int id;
    } address;
};
