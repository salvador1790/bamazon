var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({

host:"localhost",
port: 3306,
user:"root",
password:"password",
database:"bamazon"


});

purchaseBamazon();

function purchaseBamazon(){

connection.connect();



connection.query("SELECT * FROM products", function(err,res){
    if (err) throw err;
    for (var i = 0;  i < res.length; i++){
        console.log("Product ID: " + res[i].item_id);
        console.log("Product: " + res[i].product_name);
        console.log("Price:" + "$" + res[i].price);
        console.log("--------------------------------");
    }

    inquirer.prompt([
        {
            name:"ItemChoice",
            type:"rawlist",
            choices: function(){
                choiceArr = [];
                for (var i = 0; i < res.length; i++){
                    choiceArr.push(res[i].item_id);
                }
    
                return choiceArr;

            },
            message:"What is the item id of the item that you would like to buy?"

        },
        {
            name:"Amount",
            type:"input",
            message:"How many units would you like to purchase?"
        }
    ]).then(function(answer){
        var itemChosen = answer.ItemChoice;
        var amountChosen = answer.Amount;
        
        connection.query("SELECT stock_quantity FROM products WHERE item_id = " + itemChosen, function(err,res){
            if (err) throw err;
            for (var i = 0; i < res.length; i++){
                if (res[i].stock_quantity >= amountChosen){
                    console.log("We have placed your order");
                    var updatedQtty = res[i].stock_quantity - amountChosen;
                    connection.query('UPDATE products SET stock_quantity = ' + updatedQtty + ' WHERE item_id = ' + itemChosen);
                    connection.query("SELECT price FROM products WHERE item_id = " + itemChosen, function(err,res){
                        console.log("Your total is: $ "  + res[0].price * amountChosen);
                        connection.end();
                    })
                } else {
                    console.log("Insifficient Quantity!");
                    connection.end();
                }
            }
        })
    })

})
}