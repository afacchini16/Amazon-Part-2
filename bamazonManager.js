// Create a new Node application called bamazonManager.js. Running this application will:
// - List a set of menu options:
// - View Products for Sale
// - View Low Inventory
// - Add to Inventory
// - Add New Product

var mysql = require('mysql');
var inquirer = require('inquirer');
var itemInfoArray = [];
var itemNameArray = [];
var quantityArray = [];

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    user: 'root',
    password: '',

    database: 'bamazonManager'

});

connection.connect(function(error){
    if (error) {
        console.log("ERROR: " + error);
    }
    else {
        console.log("SUCCESS! Databse connected!");
    }
});


inquirer.prompt([
    {
        name: 'firstQuestion',
        message: 'What would you like to do?',
        type: 'list',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory',
         'Add New Product', 'Reset Inventory']
    }
]).then(function(answer){
    if (answer.firstQuestion === "View Products for Sale") {
        viewProductsForSale();
    }
    else if (answer.firstQuestion === "View Low Inventory") {
       displayLowQuantities();
    }
    else if (answer.firstQuestion === "Add to Inventory") {        
        getNames();
   
    }
    else if (answer.firstQuestion === "Add New Product") {
        console.log("Add New Inventory");
    }
    else if (answer.firstQuestion === "Reset Inventory") {
        resetInventory();
    }
});

// If a manager selects View Products for Sale, the app should list every 
// available item: the item IDs, names, prices, and quantities.
// 

function viewProductsForSale() {
     connection.query("SELECT * FROM products", function(error, results){
            if (error) throw error;
            else {
                for (i = 0; i < results.length; i++) {
                    console.log("Item id: " + results[i].item_id);
                    console.log("Product Name: " + results[i].product_name);
                    console.log("Price($): " + results[i].price);
                    console.log("Quantity: " + results[i].stock_quantities);
                    console.log("");
                    itemInfoArray.push(results[i]);
                }
            }
        });
}

function displayLowQuantities() {
     console.log("View Low Inventory");
        connection.query("SELECT * FROM products WHERE stock_quantities < 10", function(error, results){
            if (error) throw error;
            else {
                console.log("Low quantities: ");
            for (i = 0; i < results.length; i++) {
                console.log( results[i].product_name + ": "  + results[i].stock_quantities + " left");
            }
            }
        });
}

function getNames() {
console.log("saveField function");

connection.query("SELECT * FROM products", function(error, results){
            if (error) throw error;
            else {
            for (i = 0; i < results.length; i++) {
                itemNameArray.push(results[i].product_name);
              }
         
            }
            addInventoryQuestions(itemNameArray);
        });
}

function addInventoryQuestions(optionsArray) {
         inquirer.prompt([
            {
                name: "addToInventory",
                message: "Which item would you like to add to inventory?",
                type: "list",
                choices: optionsArray
            }

        ]).then(function(answer){
            addInventoryFunctionality(answer);
        });
}

function addInventoryFunctionality(answer) {
    var itemToAdd = answer.addToInventory;
    var quantityOfItemLeft = 0;

     connection.query("SELECT stock_quantities FROM products WHERE ?", {product_name: itemToAdd}, function(error, results) {
        if (error) throw error;
        else {
            quantityOfItemLeft = results[0].stock_quantities;
            console.log(itemToAdd + ": " + JSON.stringify(results[0].stock_quantities) + " items left.");

            inquirer.prompt([
            {
                name: "quantityToAdd",
                message: "How many would you like to add to inventory?"
            }
            ]).then(function(answer){
                var quantityEntered = answer.quantityToAdd;
                    if (quantityEntered > quantityOfItemLeft) {
                        console.log("Insufficient quantity!");
                    }
                    else {
                        var quantityAfterTransaction = parseInt(quantityOfItemLeft) + parseInt(quantityEntered);
                        connection.query("UPDATE products SET ? WHERE ?", 
                        [{
                            stock_quantities: quantityAfterTransaction
                        },
                        {
                            product_name: itemToAdd
                        }], 
                        function(error, result){
                            if (error) throw error;
                            else {
                                console.log("SUCCESS! " + quantityAfterTransaction + " items left.");
                            }
                        });
                    }
               });
          }
     });
}

function resetInventory() {
    connection.query("UPDATE products SET stock_quantities = 100", 
    [{

    }], function(error, result) {

    });
}

// If a manager selects View Low Inventory, then it should list all items 
// with a inventory count lower than five.
// 
// If a manager selects Add to Inventory, your app should display a prompt 
// that will let the manager "add more" of any item currently in the store.
// 
// If a manager selects Add New Product, it should allow the manager to 
// add a completely new product to the store.