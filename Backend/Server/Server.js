const http = require("http");
const express = require("express");
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(cors());
const testRoute = require("../Routes/TestRoute");
const gasStation = require("../Routes/GasStation");

app.use("/fun",testRoute);
app.use("/api",gasStation);



const port = 3000;


app.listen(port,()=>{
    console.log("Server running at http://localhost:3000");
});