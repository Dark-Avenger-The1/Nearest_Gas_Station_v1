export async function gasFilter(lat,lng,arr){
    
    const url ="http://localhost:3000/api/FilterGas";
    const data = {
        gasData:arr,
        userLoc:{
            lat:lat,
            lng:lng
        }
    }
    const response = await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    });

    const responseData = await response.json();

    return responseData;
}