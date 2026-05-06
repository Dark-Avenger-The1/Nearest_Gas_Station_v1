import { getRoute } from "../Hooks/getRoute.js";

export async function mapGasData(data,userData){
    const resArr = new Array(data.length);
    data.forEach((val,index)=>{
        const start = userData;
        const end = (val.type==="node")?{lat: val.lat,lng: val.lon}:{lat:val.center.lat,lng:val.center.lon};

        const response = getRoute(start, end);
        resArr[index]={
            id: val.id,
            lat: val.lat,
            lng: val.lon,
            stationName: val.tags.name,
            locData: response
        };
        
    });
    return resArr;
}