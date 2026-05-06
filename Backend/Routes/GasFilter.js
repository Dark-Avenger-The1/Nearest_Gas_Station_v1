const express = require("express");
const router =  express.Router();
const {mergeSort} = require("./MergeSort")
const haversine = require('haversine-distance');
const {binarySearch} = require("./BinarySearch");

router.post("/FilterGas",(req,res)=>{
    try{
        console.log(req.body);
        let reqArr =req.body.gasData;
        let distanceArr = [];
        let responseArray = [];
        let length = (reqArr.length>3)?3:reqArr.length;
        let finalArr = new Array(length);
        
        reqArr.forEach((val)=>{
            let gasLoc = {lat:val.lat,lng:val.lon};
            distanceArr.push({
                id:val.id,
                distance:haversine(gasLoc,req.body.userLoc)
            });
        });

        
        console.log(distanceArr);
        console.log(reqArr);
        mergeSort(reqArr,"id");
        mergeSort(distanceArr,"distance");
        
        console.log("Sorted");
        
        console.log(distanceArr);
        console.log(reqArr);
        distanceArr.forEach((val)=>{
            responseArray.push(binarySearch(val.id,reqArr,"id"));
        });
        console.log("Response Array");
        console.log(responseArray);

        for(let i=0;i<length;i++){
            console.log("Extracted "+responseArray[i]);
            finalArr[i]= responseArray[i];
            console.log("Insert Success "+finalArr[i]);
        }

        console.log("Final Arr");
        console.log(finalArr);
        const response = {
            status:"success",
            message:"Gas Filter Success",
            data:finalArr
        };

        res.json(response);
    }catch(err){
        console.log(err.message);
    }


});

module.exports=router;