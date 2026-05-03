function binarySearch(searchElem,arr,column){
    /*let low=arr[0][column];
    let high = arr[arr.length-1][column];

    while(low<=high){
        let middle = low+Math.floor((high-low)/2);
        let value = arr[middle][column];

        if(value<searchElem){
            low=middle+1
        }else if(value>target){
            high = middle-1;
        }else{
            return middle;
        }

        return null;
    }*/ 
    let low=0;
    let high = arr.length-1;

    while(low<=high){
        let middle = low+Math.floor((high-low)/2);
        let value = arr[middle][column];

        if(value<searchElem){
            low=middle+1
        }else if(value>searchElem){
            high = middle-1;
        }else{
            return arr[middle];
        }

        
    }
    return null;
}

module.exports = {binarySearch};