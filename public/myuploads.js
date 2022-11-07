// const { render, renderFile } = require("ejs");

let inputTds = document.querySelectorAll('.input-td'); // checkbox for deleting a file
// let deleteAllInput = document.querySelectorAll('.delete-all-input'); // checkbox for sharing a file
// let shareBtn = document.getElementById('share-files-btn');
let chooseBtn = document.getElementById('select-files-btn');
let backBtn = document.getElementById('back-btn');
let newDeleteBtn = document.getElementById('new-delete-btn');
let newShareBtn = document.getElementById('new-share-btn');
let chooseAllInput = document.getElementById('choose-all');
let inputs = document.querySelectorAll('.input');
let hideTds = document.querySelectorAll('.hide-td');

 let tableRows = document.querySelectorAll('.table-rows');
 let inputsArr = [];
//if the all input is clicked, change all inputs to checked

    chooseAllInput.onclick = () =>{
        if(inputsArr.length > 0){
            inputs.forEach(input => {
                inputsArr.pop();
            });   
        }
        if(chooseAllInput.checked == true){//if the all input is checked
        inputs.forEach(input => {
            input.checked = true;
            newDeleteBtn.classList.remove('d-none');
            newShareBtn.classList.remove('d-none');
                inputsArr.push(input.value);
            
            console.log('inputsArr: '+inputsArr);
        });
        }else{// if the all input is not checked
            inputs.forEach(input => {
                input.checked = false;
                newDeleteBtn.classList.add('d-none');
            newShareBtn.classList.add('d-none');
           inputsArr.pop();
            
            });   
        }
    }



chooseBtn.onclick = () =>{// display checkboxes when button is clicked
    inputTds.forEach(input => {
        input.classList.remove('d-none');
        backBtn.classList.remove('d-none');
        chooseBtn.classList.add('d-none');
    });

    hideTds.forEach(td => {
        td.classList.add('d-none');
    });

    
    tableRows.forEach((row, index) => {
        row.onclick = ()=>{
            console.log('row has been clicked')      
            inputs[index].click();      
        }
    });
   
}





backBtn.onclick = () =>{//hide checkboxes
    console.log('back btn clicked')
    window.location.reload(); 
    
}



// let inputsObj ={
//     inputs: []
// } 

function inputChecker () {// run this each time an input field is checked
//   let inputsArr = inputsObj.inputs;
    //push inputs into input array
    
//let the choose all input be false
chooseAllInput.checked = false;

    inputs.forEach(input => {
console.log(inputsArr.length, inputsArr.length == 0);


   
    if(inputsArr.indexOf(input.value) !== -1){//if value is in array

        if(input.checked == false){//and it is not checked anymore
        inputsArr.splice(inputsArr.indexOf(input.value), 1);
        console.log(3)
        }    if(inputsArr.length > 0){// if share btn is clicked and the number of inputs is greater than zero
            newShareBtn.classList.remove('d-none');
            newDeleteBtn.classList.remove('d-none');
            console.log(inputsArr.length, tableRows.length, 1);
        
            } if(inputsArr.length == 0){
                newShareBtn.classList.add('d-none');
                newDeleteBtn.classList.add('d-none');
                console.log(inputsArr.length, tableRows.length, 2);
            
                }
        
    }else{//if value is not in array

            if(input.checked == true){// if value is checked add it
                inputsArr.push(input.value);
                console.log(inputsArr.length, tableRows.length, 4);

            }if(inputsArr.length > 0){// if share btn is clicked and the number of inputs is greater than zero
                newShareBtn.classList.remove('d-none');
                newDeleteBtn.classList.remove('d-none');
                console.log(inputsArr.length, tableRows.length, 1);
            
                } if(inputsArr.length == 0){
                    newShareBtn.classList.add('d-none');
                    newDeleteBtn.classList.add('d-none');
                    console.log(inputsArr.length, tableRows.length, 2);
                
                    }
            
            if(inputsArr.length == tableRows.length){//if all inputs are checked
            
                chooseAllInput.checked = true;
                newDeleteBtn.classList.remove('d-none');
                newShareBtn.classList.remove('d-none');
                
                console.log(inputsArr.length, tableRows.length, 5);
        
            }
        }

    });
 console.log('inputsArr: '+inputsArr);
}


inputs.forEach(input => {
    input.onclick = (e) =>{
        e.stopPropagation();
        console.log('input has been clicked');
        inputChecker();
    }
});


// this function  is to post the checked boxes when share btn is clicked
let deletingLoader = document.querySelector('.deleting');
let deleteBtnFirstText = document.querySelector('.delete-btn-first-text');


newShareBtn.onclick = () =>{


    let http = new XMLHttpRequest();
    http.open('POST', 'share-many-files', true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  
    http.onreadystatechange = ()=>{
        let state = document.readyState;
        
        if(state == 'complete'){
        location.assign('/get-share-many');
        }
       }
    http.send(`inputsArr=${inputsArr}`);
    console.log('test: '+ inputsArr);
}


//function to post check boxes and their values when delete btn is clicked
newDeleteBtn.onclick = () =>{
    let result = confirm('Warning!!!\nThe files you have chosen will \nbe deleted');
    if(result == false){// confirm deletion of many files
      event.preventDefault();
      return;
    }
    deletingLoader.classList.remove('d-none');//show delete loader
    deleteBtnFirstText.classList.add('d-none');// remove delete txt

    let http = new XMLHttpRequest();
    http.open('POST', 'delete-many-files', true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  
   http.onreadystatechange = ()=>{
    let state = document.readyState;
    
    if(state == 'complete'){
        window.location.reload(); 
    }
   }
    http.send(`inputsArr=${inputsArr}`);
    console.log('test: '+ inputsArr);
}







// //testing the click and hold function

// let tableRows = document.querySelectorAll('.table-rows');
// const delay = 0;
// let timmyLong = null;
// let timmy = null;



// function touchElements() {
//     if('ontouchstart' in document.body) {
//         tableRows.forEach(row => {
//             row.addEventListener('touchstart', () =>{
//                 timeout_id = setTimeout(()=>{
//                console.log('it works:)');
//                }, 5000)
//             })
        
//         });
//     }else{
//         console.log('impossible');
//     }
// }
