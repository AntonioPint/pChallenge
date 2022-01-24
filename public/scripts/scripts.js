
function getUser() {
    let id = document.getElementById("getId").value

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `
                        ID> ${element.ID}<br>
                        NAME> ${element.NAME}<br>
                        EMAIL> ${element.EMAIL}<br>
                        <br>
                        `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/user/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function getItem() {
    let id = document.getElementById("getId").value

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `
                        ID> ${element.ID}<br>
                        NAME> ${element.NAME}<br>
                        <br>
                        `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/item/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function getOrder() {
    let id = document.getElementById("getId").value

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `
                        ID> ${element.ID}<br>
                        ITEM_ID> ${element.ITEM_ID}<br>
                        USER_ID> ${element.USER_ID}<br>
                        STATUS> ${element.QUANTITY_ALLOCATED}/${element.QUANTITY_NEEDED} 
                        (${((element.QUANTITY_ALLOCATED / element.QUANTITY_NEEDED) * 100).toFixed()}%)<br>
                        CREATION_DATE> ${new Date(element.CREATION_DATE).toUTCString()} <br>
                        <br>
                        `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/order/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function getStockMovement() {
    let id = document.getElementById("getId").value

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `
                        ID> ${element.ID}<br>
                        ITEM_ID> ${element.ITEM_ID}<br>
                        QUANTITY> ${element.QUANTITY}<br>
                        CREATION_DATE> ${new Date(element.CREATION_DATE).toUTCString()}<br>
                        <br>
                        `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/stockMovement/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function getStock() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `
                        ITEM_ID> ${element.ITEM_ID}<br>
                        STOCK> ${element.STOCK}<br>
                        <br>
                        `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/stock`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function postUser(){
    let name = document.getElementById("addUserName_ID").value;
    let email = document.getElementById("addUserEmail_ID").value;

    let obj = {name, email}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("POST", `/api/user`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(obj));
}

function postItem(){
    let name = document.getElementById("addItemName_ID").value;

    let obj = {name}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("POST", `/api/item`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(obj));
}

function postOrder(){
    let user_id = document.getElementById("addOrderUser_ID").value;
    let item_id = document.getElementById("addOrderItem_ID").value;
    let quantity = document.getElementById("addOrderQuantity_ID").value;
    let date = document.getElementById("addOrderDate_ID").value;

    let obj = {user_id, item_id, quantity, date}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("POST", `/api/order`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(obj));
}

function postStockMovement(){
    let item_id = document.getElementById("addStockMItem_ID").value;
    let quantity = document.getElementById("addStockMQuantity_ID").value;
    let date = document.getElementById("addStockMDate_ID").value;

    let obj = {item_id, quantity, date}

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("POST", `/api/stockMovement`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(obj));
}

function deleteUser(){
    let id = document.getElementById("deleteId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("DELETE", `/api/user/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function deleteItem(){
    let id = document.getElementById("deleteId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("DELETE", `/api/item/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function deleteOrder(){
    let id = document.getElementById("deleteId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("DELETE", `/api/order/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function deleteStockMovement(){
    let id = document.getElementById("deleteId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "";
            let data = JSON.parse(xmlhttp.response)
                str += `
                        MESSAGE> ${data.MESSAGE}<br>
                        <br>
                        `
            ;
            changeResultText(str)
        }
    }
    xmlhttp.open("DELETE", `/api/stockMovement/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function traceOrder(){
    let id = document.getElementById("traceId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "ORDER_ID> " + id + "<br><br>";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `STOCK_ID> ${element.STOCK_ID} | QUANTITY> ${element.QUANTITY} <br> `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/traceOrder/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function traceStockMovement(){
    let id = document.getElementById("traceId").value;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let str = "STOCK_ID> " + id + "<br><br>";
            JSON.parse(xmlhttp.response).forEach(element => {
                str += `ORDER_ID> ${element.ORDER_ID} | QUANTITY> ${element.QUANTITY} <br> `
            });
            changeResultText(str)
        }
    }
    xmlhttp.open("GET", `/api/traceStockMovement/${id}`);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
}

function changeResultText(text) {
    let element = document.getElementById("result")

    element.innerHTML = "<code>" + text + "<code>";
}
