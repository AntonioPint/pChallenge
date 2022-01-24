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
        res.send(sendMessageJSON("Item inserted"));
    });
});

app.delete("/api/item/:id", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM Item WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(sendMessageJSON("Item not found"));
                return;
            }
            res.send(sendMessageJSON("Item Deleted"));
        });
    } else {
        res.status(401).send(sendMessageJSON("No id received in parameters"));
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
    if (req.body.name == null || req.body.name == "") { res.send(sendMessageJSON("No name received")); return; }
    if (req.body.email == null || req.body.email == "") { res.send(sendMessageJSON("No email received")); return; }

    db.query("INSERT INTO User( NAME, EMAIL) VALUES (?, ?)", [req.body.name, req.body.email], (err, results) => {
        if (err) throw err;
        res.send(sendMessageJSON("User Inserted"));
    });
});

app.delete("/api/user/:id", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM User WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(sendMessageJSON("User not found"));
                return;
            }
            res.send(sendMessageJSON("User deleted"));
        });
    } else {
        res.status(401).send(sendMessageJSON("No id received in parameters"));
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
        res.send(sendMessageJSON("Quantity can not be 0 or null"));
        return;
    }

    if (req.body.item_id == null) { res.send(sendMessageJSON("No item_id received")); return; }
    if (req.body.user_id == null) { res.send(sendMessageJSON("No user_id received")); return; }

    db.query("select * from Item where ID = ?", [req.body.item_id], (err, results) => {
        if (err) throw err;
        //Verify if the item exists
        if (results.length <= 0) { res.send(sendMessageJSON("There is no such item")); return; }

        //Adds the order to the database
        db.query("INSERT INTO Orders (ITEM_ID, QUANTITY, USER_ID, CREATION_DATE) VALUES (?,?,?,?)", [req.body.item_id, req.body.quantity, req.body.user_id, date], (err, results) => {
            if (err) throw err;
            let insertedId = results.insertId;
            res.send(sendMessageJSON("Order Created"));
            allocateStockToOrders();
        });
    })
});

app.delete("/api/order/:id?", (req, res) => {
    if (!isNaN(req.params.id)) {

        db.query("DELETE FROM Orders WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(sendMessageJSON("Order not found"));
                return;
            }
            res.send(sendMessageJSON("Order Deleted"));
        });

        // Remove all ocurrences where order with id req.params.id shows on table StockOrders
        db.query("DELETE FROM Stock_Orders WHERE ORDER_ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            allocateStockToOrders();
        });

    } else {
        res.status(401).send(sendMessageJSON("No id received in parameters"));
    }
})

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
})

app.post("/api/stockMovement/", (req, res) => {
    let date = req.body.date ? req.body.date : getDateString(new Date());
    if (!req.body.quantity || req.body.quantity <= 0) {
        res.send(sendMessageJSON("Quantity can not be 0 or null"));
        return;
    }
    let quantity = req.body.quantity;
    if (req.body.item_id == null) { res.send(sendMessageJSON("No item_id received")); return; }
    
    db.query("select * from Item where ID = ?", [req.body.item_id], (err, results) => {
        if (err) throw err;
        //Verify if the item exists
        if (results.length <= 0) { res.send("There is no such item"); return; }

        //Adds the stockmovement to the database
        db.query("INSERT INTO StockMovement (CREATION_DATE, ITEM_ID, QUANTITY) values (?,?,?)", [date, req.body.item_id, quantity], (err, results) => {
            if (err) throw err;
            res.send(sendMessageJSON("Stock Movement Added"))
            allocateStockToOrders();          
        });
    });
});

app.delete("/api/stockMovement/:id?", (req, res) => {
    if (!isNaN(req.params.id)) {
        db.query("DELETE FROM StockMovement WHERE ID = ?", [req.params.id], (err, results) => {
            if (err) throw err;
            if (results.affectedRows <= 0) {
                res.send(sendMessageJSON("Stock Movement not found"));
                return;
            }
            res.send(sendMessageJSON("Stock Movement Deleted"));
        });

        //Remove all ocurrences where StockMovement with id req.params.id shows on table StockOrders
        db.query("DELETE FROM Stock_Orders WHERE STOCK_ID = ?", [req.params.id]);

    } else {
        res.status(401).send(sendMessageJSON("No id received in parameters"));
    }
});

app.get("/api/stock", (req, res) => {
    db.query(stockQuery, (err, results) => {
        if (err) throw err;
        res.send(results);
    })
});

app.get("/api/traceOrder/:id?", (req, res) => {
    if(req.params.id == null || req.params.id == ""){res.send([]); return;}
    db.query("Select * from Stock_Orders where ORDER_ID = ?", [req.params.id], (err, results) =>{
        res.send(results);
    });
});

app.get("/api/traceStockMovement/:id?", (req, res) => {
    if(req.params.id == null || req.params.id == ""){res.send([]); return;}
    db.query("Select * from Stock_Orders where STOCK_ID = ?", [req.params.id], (err, results) =>{
        res.send(results);
    });
});

async function sendEmail(email, subject, text) {
    //Uncomment to auto create new testAccount
    //let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            // If testAccount uncommented, uncomment the next 2 lines and comment last 2 inside auth object
            //user: testAccount.user, // generated ethereal user
            //pass: testAccount.pass, // generated ethereal password
            user: process.env.EMAIL,
            pass: process.env.PASSWD
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

function sendMessageJSON(text) {
    return {
        "MESSAGE": text
    }
}

function allocateStockToOrders() {
    db.query(quantityMovementQuery, (err, stockMovements) => {
        stockMovements.forEach(stock => {
            db.query(quantityOrderQuery, [stock.ITEM_ID], (err, orders) => {
                orders.forEach(order => {
                    if (stock.STOCK >= order.QUANTITY_LEFT) {
                        stock.STOCK -= order.QUANTITY_LEFT;
                        db.query("select * from User u inner join Orders o on o.USER_ID = u.ID  where o.ID = ?", [order.ORDER_ID], (err, results) =>{
                            //Send Email
                            sendEmail(results[0].EMAIL, "PChallenge - Information", "Your order has been fulfilled <br> Order ID> ");
                        })
                        db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, order.QUANTITY_LEFT]);
                    } else {
                        db.query("INSERT INTO Stock_Orders(`ORDER_ID`, `STOCK_ID`, `QUANTITY`) VALUES (?,?,?)", [order.ORDER_ID, stock.STOCK_ID, stock.STOCK]);
                        stock.STOCK = 0;
                        return;
                    }
                });
            });
        });
    });
}

function getDateString(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0
    var yyyy = date.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

//------- Main Queries -------//

//gets the total of stock available
let stockQuery = 'select a.ITEM_ID, sum(a.STOCK) as "STOCK" from (select sm.ID as "STOCK_ID", sm.ITEM_ID, (sm.IN - coalesce(so.OUT,0)) as "STOCK" from (SELECT STOCK_ID, sum(QUANTITY) as "OUT" from Stock_Orders group by STOCK_ID ) so right join (select ID, ITEM_ID, QUANTITY as "IN" from StockMovement) sm on sm.ID = so.STOCK_ID) a group by a.ITEM_ID';
//get the quantity of every stockMovement already ordered by date asc
let quantityMovementQuery = 'select sm.ID as "STOCK_ID", sm.ITEM_ID, (sm.IN - coalesce(so.OUT,0)) as "STOCK" from (SELECT STOCK_ID, sum(QUANTITY) as "OUT" from Stock_Orders group by STOCK_ID ) so right join (select ID, ITEM_ID, QUANTITY as "IN" from StockMovement) sm on sm.ID = so.STOCK_ID where (sm.IN - coalesce(so.OUT,0)) > 0'
//get the quantity left of every order
let quantityOrderQuery = 'select o.ID as "ORDER_ID", o.ITEM_ID, (o.NEEDED - COALESCE(so.DELIVERED,0)) as "QUANTITY_LEFT" from (select ORDER_ID, sum(QUANTITY) as "DELIVERED" from Stock_Orders s group by s.ORDER_ID) so right join (select ID, ITEM_ID, QUANTITY as "NEEDED" from Orders) o on so.ORDER_ID = o.ID where (o.NEEDED - COALESCE(so.DELIVERED,0)) > 0 and ITEM_ID = ?'

app.listen(PORT, () => { console.log("Server listening on http://localhost:" + PORT) })

// TODO:
// The system should be able to provide the following features:
// - create, read, update and delete and list all entities ✔
// - when an order is created, it should try to satisfy it with the current stock. ✔
// - when a stock movement is created, the system should try to attribute it to an order that isn't complete. ✔
// - when an order is complete, send a notification by email to the user that created it  ✔
// - trace the list of stock movements that were used to complete the order, and vice-versa ✔
// - show current completion of each order ✔

