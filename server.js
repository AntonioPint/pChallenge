const express = require("express");
const mysql = require("mysql");
const nodemailer = require("nodemailer");
require("dotenv").config();
let app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database");
});

let PORT = process.env.PORT || 9000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    return res.sendFile(__dirname + "/index.html");
});

app.get("/api/item/:id?", (req, res) => {
    let sqlquery = "select * from Item ";
    let values = [];

    if (req.params.id && !isNaN(req.params.id)) {
        sqlquery += "where ID = ? ";
        values.push(req.params.id);
    }

    db.query(sqlquery, values, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post("/api/item", (req, res) => {
    // verify values received
    if (req.body.name == null || req.body.name == "") { res.send("No name received"); return; }

    db.query("INSERT INTO Item (NAME) VALUES (?)", [req.body.name], (err, results) => {
        if (err) throw err;
        res.send(formatMessageJSON("Item inserted"));
    });
});

app.put("/api/item/:id?", (req, res) => {
    if (req.body.name && req.body.name != "") {
        db.query("select * from Item where ID = ?", [req.params.id], (err, results) => {
            if (results.length > 0) {
                let query = "UPDATE Item set NAME = ? where ID = ?";
                let values = [];
                values.push(req.body.name);
                values.push(req.params.id);
                db.query(query, values);
                res.send(formatMessageJSON("Item Changed"));
            } else {
                res.send(formatMessageJSON("There is no Item with that Id"));
            }
        });
    } else {
        res.send(formatMessageJSON("Nothing to Change"));
    }
});

app.delete("/api/item/:id", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM Item WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(formatMessageJSON("Item not found"));
                return;
            }
            res.send(formatMessageJSON("Item Deleted"));
        });
    } else {
        res.status(401).send(formatMessageJSON("No id received in parameters"));
    }
});

app.get("/api/user/:id?", (req, res) => {
    let sqlquery = "select * from User ";
    let values = [];

    if (req.params.id) {
        sqlquery += "where ID = ?";
        values.push(req.params.id);
    }

    db.query(sqlquery, values, (err, results) => {
        res.send(results);
    });
});

app.post("/api/user", (req, res) => {
    if (req.body.name == null || req.body.name == "") { res.send(formatMessageJSON("No name received")); return; }
    if (req.body.email == null || req.body.email == "") { res.send(formatMessageJSON("No email received")); return; }

    db.query("INSERT INTO User( NAME, EMAIL) VALUES (?, ?)", [req.body.name, req.body.email], (err, results) => {
        if (err) throw err;
        res.send(formatMessageJSON("User Inserted"));
    });
});

app.put("/api/user/:id?", (req, res) => {
    let user_id = req.params.id;
    let name = req.body.name;
    let email = req.body.email;

    let sqlQuery = "Update User set";
    let values = [];

    if (!user_id || isNaN(user_id)) {
        res.send(formatMessageJSON("Id inserted is not valid"));
        return;
    }

    db.query("select * from User where ID = ?", [user_id], (err, results) => {

        if (results.length > 0) {
            if (name && name != "") {
                sqlQuery += " NAME = ?,";
                values.push(name);
            }

            if (email && email != "") {
                sqlQuery += " EMAIL = ?,";
                values.push(email);
            }

            if (values.length > 0) {
                //removing "," character
                sqlQuery = sqlQuery.slice(0, -1);
            } else {
                res.send(formatMessageJSON("Nothing to update"));
                return;
            }
            sqlQuery += "where ID = ?";
            values.push(user_id);

            db.query(sqlQuery, values);
            res.send(formatMessageJSON("User updated"));

        } else {
            res.send(formatMessageJSON("No user found"))
        }
    });
});

app.delete("/api/user/:id", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM User WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(formatMessageJSON("User not found"));
                return;
            }
            res.send(formatMessageJSON("User deleted"));
        });
    } else {
        res.status(401).send(formatMessageJSON("No id received in parameters"));
    }
});

app.get("/api/order/:id?", (req, res) => {
    let sqlquery = 'select o.ID, coalesce(o.QUANTITY,0) as "QUANTITY_NEEDED" , coalesce(a.SO,0) as "QUANTITY_ALLOCATED" , ITEM_ID ,USER_ID, CREATION_DATE from Orders o left join (SELECT ORDER_ID, sum(QUANTITY) as "SO" FROM Stock_Orders group by ORDER_ID) a on o.ID = a.ORDER_ID';
    let values = [];

    if (req.params.id && !isNaN(req.params.id)) {
        sqlquery += " where ID = ?";
        values.push(req.params.id);
    }

    db.query(sqlquery, values, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post("/api/order/", (req, res) => {
    let date = req.body.date ? req.body.date : getDateString(new Date());
    if (!req.body.quantity || req.body.quantity <= 0) {
        res.send(formatMessageJSON("Quantity can not be 0 or null"));
        return;
    }

    if (req.body.item_id == null) { res.send(formatMessageJSON("No item_id received")); return; }
    if (req.body.user_id == null) { res.send(formatMessageJSON("No user_id received")); return; }

    db.query("select * from Item where ID = ?", [req.body.item_id], (err, results) => {
        if (err) throw err;
        //Verify if the item exists
        if (results.length <= 0) { res.send(formatMessageJSON("There is no such item")); return; }

        //Adds the order to the database
        db.query("INSERT INTO Orders (ITEM_ID, QUANTITY, USER_ID, CREATION_DATE) VALUES (?,?,?,?)", [req.body.item_id, req.body.quantity, req.body.user_id, date], (err, results) => {
            if (err) throw err;
            let insertedId = results.insertId;
            res.send(formatMessageJSON("Order Created"));
            allocateStockToOrders();
        });
    })
});

app.put("/api/order/:id?", (req, res) => {
    let order_id = req.params.id;
    let user_id = req.body.user_id;
    let item_id = req.body.item_id;
    let quantity = req.body.quantity;
    let date = req.body.date;

    let sqlQuery = "Update Orders set";
    let values = [];

    if (!order_id || isNaN(order_id)) {
        res.send(formatMessageJSON("Id inserted is not valid"));
        return;
    }

    db.query("select * from Orders where ID = ?", [order_id], (err, results) => {
        if (results.length > 0) {
            if (user_id && user_id != "") {
                sqlQuery += " USER_ID = ?,";
                values.push(user_id);
            }
            if (item_id && item_id != "") {
                sqlQuery += " ITEM_ID = ?,";
                values.push(item_id);
            }
            if (quantity && !isNaN(quantity)) {
                sqlQuery += " QUANTITY = ?,";
                values.push(quantity);
            }
            if (date && date != "") {
                sqlQuery += " CREATION_DATE = ?,";
                values.push(date);
            }
            if (values.length > 0) {
                //removing "," character
                sqlQuery = sqlQuery.slice(0, -1);
            } else {
                res.send(formatMessageJSON("Nothing to update"));
                return;
            }
            sqlQuery += "where ID = ?";
            values.push(order_id);

            db.query(sqlQuery, values, (err, results) => {
                db.query("delete from Stock_Orders where ORDER_ID = ?", [order_id], (err, results) =>{
                    allocateStockToOrders()
                })
            });
            res.send(formatMessageJSON("Order updated"));
        } else {
            res.send(formatMessageJSON("No order found"))
        }
    });
});

app.delete("/api/order/:id?", (req, res) => {
    if (!isNaN(req.params.id)) {

        db.query("DELETE FROM Orders WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(formatMessageJSON("Order not found"));
                return;
            }
            res.send(formatMessageJSON("Order Deleted"));
        });

        // Remove all ocurrences where order with id req.params.id shows on table StockOrders
        db.query("DELETE FROM Stock_Orders WHERE ORDER_ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            allocateStockToOrders();
        });

    } else {
        res.status(401).send(formatMessageJSON("No id received in parameters"));
    }
});

app.get("/api/stockMovement/:id?", (req, res) => {
    let sqlquery = "select * from StockMovement";
    let values = [];

    if (req.params.id) {
        sqlquery += " where ID = ?";
        values.push(req.params.id);
    }

    db.query(sqlquery, values, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post("/api/stockMovement/", (req, res) => {
    let date = req.body.date ? req.body.date : getDateString(new Date());
    if (!req.body.quantity || req.body.quantity <= 0) {
        res.send(formatMessageJSON("Quantity can not be 0 or null"));
        return;
    }
    let quantity = req.body.quantity;
    if (req.body.item_id == null) { res.send(formatMessageJSON("No item_id received")); return; }

    db.query("select * from Item where ID = ?", [req.body.item_id], (err, results) => {
        if (err) throw err;
        //Verify if the item exists
        if (results.length <= 0) { res.send("There is no such item"); return; }

        //Adds the stockmovement to the database
        db.query("INSERT INTO StockMovement (CREATION_DATE, ITEM_ID, QUANTITY) values (?,?,?)", [date, req.body.item_id, quantity], (err, results) => {
            if (err) throw err;
            res.send(formatMessageJSON("Stock Movement Added"))
            allocateStockToOrders();
        });
    });
});

app.put("/api/stockMovement/:id?", (req, res) => {
    let stock_id = req.params.id;
    let item_id = req.body.item_id;
    let quantity = req.body.quantity;
    let date = req.body.date;

    let sqlQuery = "Update StockMovement set";
    let values = [];

    if (!stock_id || isNaN(stock_id)) {
        res.send(formatMessageJSON("Id inserted is not valid"));
        return;
    }

    db.query("select * from StockMovement where ID = ?", [stock_id], (err, results) => {
        if (results.length > 0) {
            if (item_id && item_id != "") {
                sqlQuery += " ITEM_ID = ?,";
                values.push(item_id);
            }
            if (quantity && !isNaN(quantity)) {
                sqlQuery += " QUANTITY = ?,";
                values.push(quantity);
            }
            if (date && date != "") {
                sqlQuery += " CREATION_DATE = ?,";
                values.push(date);
            }

            if (values.length > 0) {
                //removing "," character
                sqlQuery = sqlQuery.slice(0, -1);
            } else {
                res.send(formatMessageJSON("Nothing to update"));
                return;
            }
            sqlQuery += "where ID = ?";
            values.push(stock_id);

            db.query(sqlQuery, values, (err, results) => {
                db.query("delete from Stock_Orders where STOCK_ID = ?", [stock_id], (err, results) =>{
                    allocateStockToOrders()
                })
            });
            res.send(formatMessageJSON("StockMovement updated"));

        } else {
            res.send(formatMessageJSON("No StockMovement found"))
        }
    });
});

app.delete("/api/stockMovement/:id?", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM StockMovement WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(formatMessageJSON("Stock Movement not found"));
                return;
            }
            res.send(formatMessageJSON("Stock Movement Deleted"));
        });

        //Remove all ocurrences where StockMovement with id req.params.id shows on table StockOrders
        db.query("DELETE FROM Stock_Orders WHERE STOCK_ID = ?", [req.params.id]);

    } else {
        res.status(401).send(formatMessageJSON("No id received in parameters"));
    }
});

app.get("/api/stock", (req, res) => {
    db.query(stockQuery, (err, results) => {
        if (err) throw err;
        res.send(results);
    })
});

app.get("/api/traceOrder/:id?", (req, res) => {
    if (req.params.id == null || req.params.id == "") { res.send([]); return; }
    db.query("Select * from Stock_Orders where ORDER_ID = ?", [req.params.id], (err, results) => {
        res.send(results);
    });
});

app.get("/api/traceStockMovement/:id?", (req, res) => {
    if (req.params.id == null || req.params.id == "") { res.send([]); return; }
    db.query("Select * from Stock_Orders where STOCK_ID = ?", [req.params.id], (err, results) => {
        res.send(results);
    });
});

async function sendEmail(email, subject, text) {
    //Uncomment to auto create new testAccount
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            // If testAccount uncommented, uncomment the next 2 lines and comment last 2 inside auth object
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
            //user: process.env.EMAIL,
            //pass: process.env.PASSWD
        },
    });
    // send email
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text
    });
}

function formatMessageJSON(text) {
    return {
        "MESSAGE": text
    }
}

async function allocateStockToOrders() {
    let stockMovements = await executeQueryAsync(quantityMovementQuery);
    let orders = await executeQueryAsync(quantityOrderQuery)
    stockMovements.forEach(stock => {
        orders.forEach(order => {
            if (stock.ITEM_ID == order.ITEM_ID) {
                if (stock.STOCK >= order.QUANTITY_LEFT) {
                    let stockorderquantity = order.QUANTITY_LEFT;
                    db.query("select * from User u inner join Orders o on o.USER_ID = u.ID  where o.ID = ?", [order.ORDER_ID], (err, results) => {
                        //Send Email
                        sendEmail(results[0].EMAIL, "PChallenge - Information", "Your order has been fulfilled <br> Order ID> ");
                    })
                    db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, stockorderquantity]);
                    stock.STOCK -= stockorderquantity;
                    order.QUANTITY_LEFT = 0;
                } else {
                    let stockorderquantity = stock.STOCK;
                    db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, stock.STOCK]);
                    order.QUANTITY_LEFT -= stockorderquantity;
                    stock.STOCK = 0;
                    return;
                }
            }
        });
    });

    // db.query(quantityMovementQuery, (err, stockMovements) => {
    //     console.log("1")
    //     stockMovements.forEach(stock => {
    //         db.query(quantityOrderQuery, [stock.ITEM_ID], (err, orders) => {
    //             console.log("2")
    //             orders.forEach(order => {
    //                 if (stock.STOCK >= order.QUANTITY_LEFT) {
    //                     stock.STOCK -= order.QUANTITY_LEFT;
    //                     db.query("select * from User u inner join Orders o on o.USER_ID = u.ID  where o.ID = ?", [order.ORDER_ID], (err, results) =>{
    //                         //Send Email
    //                         sendEmail(results[0].EMAIL, "PChallenge - Information", "Your order has been fulfilled <br> Order ID> ");
    //                     })
    //                     db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, order.QUANTITY_LEFT]);
    //                 } else {
    //                     db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, stock.STOCK]);
    //                     stock.STOCK = 0;
    //                     return;
    //                 }
    //             });
    //         });
    //     });
    // });
}

let executeQueryAsync = (mysqlQuery, values) => {
    return new Promise((resolve, reject) => {
        db.query(mysqlQuery, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
}

function getDateString(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0
    var yyyy = date.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//------- Main Queries -------//

//gets the total of stock available
let stockQuery = 'select a.ITEM_ID, sum(a.STOCK) as "STOCK" from (select sm.ID as "STOCK_ID", sm.ITEM_ID, (sm.IN - coalesce(so.OUT,0)) as "STOCK" from (SELECT STOCK_ID, sum(QUANTITY) as "OUT" from Stock_Orders group by STOCK_ID ) so right join (select ID, ITEM_ID, QUANTITY as "IN" from StockMovement) sm on sm.ID = so.STOCK_ID) a group by a.ITEM_ID';
//get the quantity of every stockMovement already ordered by date asc
let quantityMovementQuery = 'select sm.ID as "STOCK_ID", sm.ITEM_ID, (sm.IN - coalesce(so.OUT,0)) as "STOCK" from (SELECT STOCK_ID, sum(QUANTITY) as "OUT" from Stock_Orders group by STOCK_ID ) so right join (select ID, ITEM_ID, QUANTITY as "IN" from StockMovement) sm on sm.ID = so.STOCK_ID where (sm.IN - coalesce(so.OUT,0)) > 0'
//get the quantity left of every order
let quantityOrderQuery = 'select o.ID as "ORDER_ID", o.ITEM_ID, (o.NEEDED - COALESCE(so.DELIVERED,0)) as "QUANTITY_LEFT" from (select ORDER_ID, sum(QUANTITY) as "DELIVERED" from Stock_Orders s group by s.ORDER_ID) so right join (select ID, ITEM_ID, QUANTITY as "NEEDED" from Orders) o on so.ORDER_ID = o.ID where (o.NEEDED - COALESCE(so.DELIVERED,0)) > 0 ' //and ITEM_ID = ?

app.listen(PORT, () => { console.log("Server listening on http://localhost:" + PORT) })

// TODO:
// The system should be able to provide the following features:
// - create, read, update and delete and list all entities ✔
// - when an order is created, it should try to satisfy it with the current stock. ✔
// - when a stock movement is created, the system should try to attribute it to an order that isn't complete. ✔
// - when an order is complete, send a notification by email to the user that created it  ✔
// - trace the list of stock movements that were used to complete the order, and vice-versa ✔
// - show current completion of each order ✔

