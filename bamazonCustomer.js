var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1Fungi99",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
});
var SKUArray = [];
console.log("Selecting all products...\n");
connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  for (var i = 0; i < res.length; i++) {
    console.log("SKU:        " + res[i].item_ID);
    console.log("Product:    " + res[i].product_name);
    console.log("Department: " + res[i].department_name);
    console.log("Price:      " + res[i].price);
    console.log("Stock:      " + res[i].stock_quantity);
    console.log(" ");

    SKUArray.push(res[i].item_ID);
  }
});
var inquirer = require("inquirer");
inquirer
  .prompt([
    {
      type: "input",
      name: "sku",
      message: "What SKU whould you like to buy?",
      validate: function(value) {
        var valid = SKUArray.includes(value);
        return valid || "Please Re-Check the SKU";
      },
      filter: Number
    },
    {
      type: "input",
      name: "quantity",
      message: "How many do you need?",
      validate: function(value) {
        var valid = !isNaN(parseFloat(value));
        return valid || "Please enter a number";
      },
      filter: Number
    }
  ])
  .then(answers => {
    connection.query(
      "SELECT * FROM products WHERE item_ID = " + answers.sku,
      function(err, res) {
        if (err) throw err;
        else if (answers.quantity > res.stock_quantity) {
          console.log(
            "We're sorry, but it seems that we are not able to fulfill your order at this time..."
          );
        } else {
          var updatedStock = res[0].stock_quantity - answers.quantity;
          connection.query(
            "UPDATE products SET stock_quantity = " +
              updatedStock +
              " WHERE item_ID = " +
              answers.sku,
            function(err, res) {
              if (err) throw err;
              connection.end();
            }
          );
        }
      }
    );
  });
