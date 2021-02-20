"use strict";

const express = require("express");
const app = express();
const port = 3000; //Set port of host

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

global.orders = []; //set array for order

let states = []; //status of order
states.push("ordered");
states.push("cooked");
states.push("served");
states.push("paid");

//http://localhost:3000/placeorder.html page
app.post("/PlaceOrder", (req, res) => {
  const order = {};
  order.state = "ordered";
  order.tableNumber = req.body["tableNumber"];
  delete req.body.tableNumber;
  order.items = req.body;
  order.number = global.orders.length + 1; //Note, the order number is 1 more than the orders index in the array (becuase we don't want an order #0)
  global.orders.push(order);
  res.send(`Order Accepted #${order.number}`); //print order accepted and order number
});

//http://localhost:3000/view to view order, run outputOrders function
app.get("/view", (req, res) => {
  outputOrders(req, res);
});

//setState page, req=request, res=response
app.get("/setState", (req, res) => {
  setOrderState(req, res);
  outputOrders(req, res);
});
//when type http://localhost:3000/  get 'Hello World!'
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

function outputOrders(req, res) {
  let filter = req.query["filter"];
  let ordersHTML = [];
  ordersHTML.push(
    "<html><head><link type='text/css' rel='stylesheet' href='/css/style.css'></head><body>"
  );
  ordersHTML.push('<table id="orderTable">');
  for (const order of global.orders) {
    if (filter == null || order.state == filter) {
      ordersHTML.push(orderHTML(order));
    }
  }
  ordersHTML.push("</table>");
  ordersHTML.push("</body></html>");
  res.send(ordersHTML.join(""));
}
//Task - convert text into table - order no, table, 1 columns for all food items, order state
//where <span> is need to change it to <td>
//table <tr>
function orderHTML(order) {
  let elements = [];
  elements.push("<tr>");
  elements.push(`<td>Order#${order.number}</td>`);
  elements.push(`<td>Table#${order.tableNumber}</td>`);
  elements.push("<td>");
  for (const key in order.items) {
    const quantity = order.items[key];
    if (quantity > 0) {
      elements.push(`${quantity} * ${key}<br>`);
    }
  }
  elements.push("</td>");
  elements.push(
    `<td order-status='${order.state}' class='status'>${order.state}</td>`
  );
  elements.push("<td>" + stateButtons(order) + "</td>");

  elements.push("</tr>");
  console.log(order);
  return elements.join("");
}
//create buttons at the end of order
//Further work - Different button for different people defy role and right for different people
function stateButtons(order) {
  let buttons = [];
  //loop over states, create buttons and join together html and return
  for (const state of states) {
    buttons.push(
      `<a href=/setState?orderNumber=${order.number}&state=${state}><button>Mark as ${state} </button></a>`
    );
  }
  return buttons.join(" ");
}

//take order no and substract 1 as array start from 0 (array is zero base), parseInt turn string to number
function setOrderState(req, res) {
  //transition state - based on a ?state=ordernum NameValue pair
  let order = global.orders[parseInt(req.query["orderNumber"]) - 1];
  order.state = req.query["state"]; //get state out of the request
}
