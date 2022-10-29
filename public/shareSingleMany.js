let sharingLoader = document.querySelector('.sharing');
let shareBtnFirstText = document.querySelector('.share-btn-first-text');
let shareBtn = document.getElementById('share-btn');
// let uploading = document.querySelector('.uploading');
let shareForm = document.getElementById('share-form');





    shareForm.onsubmit = () =>{
        sharingLoader.classList.remove('d-none');
        shareBtnFirstText.classList.add('d-none');
    }



    let addEmailBtn = document.getElementById('add-email-btn');
let emailAddressDiv = document.querySelector('.receiver-email-addresses');
let i = 2;

addEmailBtn.onclick = () => {
let bigDiv = document.createElement('div');
bigDiv.classList.add("all-addresses");
let div = document.createElement('div');
div.classList.add('form-floating', 'email-div');
div.id = `email-div-${i}`;
let label = document.createElement('label');
label.classList.add('align-self-start');
label.setAttribute('for', `email${i}`);
label.innerText = "Another Receiver";
let input = document.createElement('input');
input.type = 'email';
input.classList.add('form-control');
input.name = 'email';
input.id = `email${i}`;
input.placeholder = "Another receiver";
input.setAttribute('required', '');
let button = document.createElement('button');
button.type = 'button';
button.id = `remove-btn-${i}`;
button.classList.add('btn', 'btn-outline-danger', 'remove-btn');
button.innerText = 'Remove';
//add the label and input to the div

div.appendChild(input);
div.appendChild(label);
bigDiv.appendChild(div);
bigDiv.appendChild(button);
//add form control div to the main div
emailAddressDiv.appendChild(bigDiv);
console.log(document.querySelectorAll('.remove-btn'), document.querySelectorAll('.all-addresses'))
i++;



//remove email

let removeBtns = document.querySelectorAll('.remove-btn');
let bigDivs = document.querySelectorAll('.all-addresses');

console.log("test: ",removeBtns, bigDivs);




removeBtns.forEach((btn, index, arr)=>{

    btn.onclick = () =>{
        emailAddressDiv.removeChild(bigDivs[index]);
    }
})
    


}
