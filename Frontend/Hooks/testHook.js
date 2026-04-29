import { API } from "../../Helper/LocalAPI.js"


testFun();
async function testFun(){
    const response = await fetch(API.test,{
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify({
            name:"Jasper",
            message:"hewwo"
        })
    });

    const responseData = await response.json();

    console.log(responseData.message);
}