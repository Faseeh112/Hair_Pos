// ============================================================
// Hair POS - MongoDB Database Script
// Database: hair_clinic
// ============================================================

// Create / switch to database
use hair_clinic;


// ============================================================
// DROP EXISTING COLLECTIONS (OPTIONAL)
// Remove these lines if you do NOT want to delete existing data
// ============================================================

db.products.drop();
db.services.drop();
db.sales.drop();
db.staff.drop();
db.users.drop();


// ============================================================
// CREATE COLLECTIONS
// ============================================================

db.createCollection("products");
db.createCollection("services");
db.createCollection("sales");
db.createCollection("staff");
db.createCollection("users");


// ============================================================
// PRODUCTS
// ============================================================

db.products.createIndex(
    { Name: 1 },
    { unique: true }
);


// ============================================================
// SERVICES
// ============================================================

db.services.createIndex(
    { Name: 1 },
    { unique: true }
);


// ============================================================
// STAFF
// ============================================================

db.staff.createIndex(
    { StaffID: 1 },
    { unique: true }
);


// ============================================================
// USERS
// ============================================================

db.users.createIndex(
    { username: 1 },
    { unique: true }
);


// ============================================================
// SALES
// ============================================================

db.sales.createIndex(
    { Date: -1 }
);


// ============================================================
// SAMPLE PRODUCT
// ============================================================

db.products.insertOne({
    Name: "Foundation Shampoo",
    Price: 25.00,
    Stock: 10,
    Image: "",
    Category: "products",
    Description: "Professional shampoo for hair care.",
    CreatedAt: new Date()
});


// ============================================================
// SAMPLE SERVICE
// ============================================================

db.services.insertOne({
    Name: "Hair Treatment",
    Price: 50.00,
    StaffIDs: "",
    RoomIDs: "",
    Description: "Professional hair treatment service.",
    Duration: "30 mins",
    CreatedAt: new Date()
});


// ============================================================
// SAMPLE STAFF
// ============================================================

db.staff.insertOne({
    StaffID: "ST001",
    Name: "John",
    LeaveStart: null,
    LeaveEnd: null
});


// ============================================================
// SAMPLE USERS
// ============================================================

db.users.insertMany([
    {
        username: "admin",
        password: "abc",
        role: "admin"
    },
    {
        username: "user1",
        password: "abc",
        role: "user"
    }
]);


// ============================================================
// SAMPLE SALE
// ============================================================

db.sales.insertOne({
    Date: new Date(),
    CustomerName: "Guest",
    FullDetails: [],
    Total: 0
});


// ============================================================
// VERIFY DATABASE
// ============================================================

show dbs;
show collections;

db.products.find();
db.services.find();
db.staff.find();
db.users.find();
db.sales.find();