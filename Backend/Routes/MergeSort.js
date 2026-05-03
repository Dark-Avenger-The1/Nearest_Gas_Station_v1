function mergeSort(arr,column){
    let length = arr.length;

    if(length<=1) return;

    let middle = Math.floor(length/2);
    let leftArray = new Array(middle);
    let rightArray = new Array(length-middle);

    let i =0;
    let j=0;

    for(;i<length;i++){
        if(i<middle){
            leftArray[i]=arr[i];

        }else{
            rightArray[j]=arr[i];
            j++;
        }
    }

    mergeSort(leftArray,column);
    mergeSort(rightArray,column);
    merge(leftArray,rightArray,arr,column);
}

function merge(leftArr,rightArr,arr,column){
    let leftSize = Math.floor(arr.length/2);
    let rightSize = arr.length-leftSize;
    let i=0;
    let j =0;
    let k=0;

    while(i<leftSize && j<rightSize){
        if(leftArr[i][column]<rightArr[j][column]){
            arr[k]=leftArr[i];
            i++;
        }else{
            arr[k]=rightArr[j];
            j++;
        }
        k++;
    }

    while(i<leftSize){
        arr[k]=leftArr[i][column];
        i++;
        k++;
    }

    while(j<rightSize){
        arr[k]=rightArr[j];
        j++
        k++;
    }
}

module.exports={mergeSort};