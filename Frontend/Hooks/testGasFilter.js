export async function gasFilter(lat,lng,arr){
    
    try {
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

        if(responseData.status!=success){
            throw new Error(responseData.message);
        }
        return responseData;
    } catch (error) {
        alert(error.message);
    }
}