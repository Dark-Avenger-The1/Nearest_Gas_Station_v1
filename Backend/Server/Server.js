const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(cors());
try{
    const testRoute = require("../Routes/TestRoute");
    const gasStation = require("../Routes/GasStation");
    const gasFilter = require("../Routes/GasFilter");

    app.use("/fun",testRoute);
    app.use("/api",gasStation);
    app.use("/api",gasFilter);
}catch(err){
    console.log("Start up err",err.message);
}


const port = 3000;


app.listen(port,()=>{
    console.log("Server running at http://localhost:3000");
});