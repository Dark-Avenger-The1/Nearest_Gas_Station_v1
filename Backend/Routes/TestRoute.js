const express = require("express");
const router = express.Router();

router.post("/test",(req,res)=>{
    console.log("Data Received: "+req.body);

    res.json({
        message:`Hello ${req.body.name} we received your request.`,
        data:req.body
    });
});


module.exports = router;