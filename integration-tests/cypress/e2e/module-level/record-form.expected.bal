type Person record {
    string name;
    record {
        string city;
        int id;
    } address;
};
