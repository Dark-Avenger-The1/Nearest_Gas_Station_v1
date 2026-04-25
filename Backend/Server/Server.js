const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(cors());
const testRoute = require("../Routes/TestRoute");

app.use("/fun",testRoute);

const server = http.createServer(function(req,res){
    res.write("test");
    res.end();
});
const port = 3000;


app.listen(port,()=>{
    console.log("Server running at http://localhost:3000");
});