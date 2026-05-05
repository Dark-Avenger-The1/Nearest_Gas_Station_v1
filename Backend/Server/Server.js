const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");
const { loadEnv } = require("../../Helper/loadEnv");

loadEnv();

app.use(express.json());
app.use(cors());
try{
    const testRoute = require("../Routes/TestRoute");
    const gasStation = require("../Routes/GasStation");
    const gasFilter = require("../Routes/GasFilter");
    const openRoute = require("../Routes/OpenRoute");

    app.use("/fun",testRoute);
    app.use("/api",gasStation);
    app.use("/api",gasFilter);
    app.use("/api",openRoute);
}catch(err){
    console.log("Start up err",err.message);
}


const port = 3000;


app.listen(port,()=>{
    console.log("Server running at http://localhost:3000");
});
