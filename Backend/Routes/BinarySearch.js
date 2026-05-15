function binarySearch(searchElem,arr,column){
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