

  let shareSuccessAlert = document.getElementById('share-success-alert');
  function hideSuccess() {
  if(shareSuccessAlert !== null){
      setTimeout(()=>{
      shareSuccessAlert.classList.add('d-none');
      }, 6000)
  }
}
hideSuccess();




// let fileInput = document.getElementById('files');
// let progress = document.querySelector('progress');
// let progressIndicator = document.querySelector('.progress-percentage');
// let pr = document.querySelector('.pr');
let sharingLoader = document.querySelector('.sharing');
let shareBtnFirstText = document.querySelector('.share-btn-first-text');
// let cancelBtn = document.getElementById('cancel-btn');
let shareBtn = document.getElementById('share-btn');
// let uploading = document.querySelector('.uploading');
let shareForm = document.getElementById('share-form');



// cancelBtn.onclick = () =>{
//     window.location.reload(); 
//     cancelBtn.classList.add('disabled');
    
//     }

    shareForm.onsubmit = () =>{
        // cancelBtn.classList.remove('disabled');
        sharingLoader.classList.remove('d-none');
        shareBtnFirstText.classList.add('d-none');
    }

    // let shareAfterBtn = document.getElementById('share-after-btn');
    // let shareOnlyForm = document.getElementById('share-only-form');

    // shareAfterBtn.onclick = ()=>{
    //     let xhr = new XMLHttpRequest();
    //            xhr.open('POST', '', true);

    //   let formData = new FormData(shareOnlyForm);
    //    xhr.send(formData);

    // }







//share button code
// shareBtn.onclick = e => {
//     console.log('file shared')
//        //ajax pst request to the server
//        let xhr = new XMLHttpRequest();
//        xhr.open('POST', 'upload', true);
   
//        //progress function
//        xhr.upload.onprogress = e =>{
//            cancelBtn.classList.remove('disabled');
//            pr.classList.remove('d-none');
//            let percentage = Math.round((e.loaded/e.total)*100);
//            progress.value = percentage;
//            progressIndicator.innerHTML = percentage + ' %'
//            console.log(e.loaded, e.total);
//            if(percentage >= 0 && percentage < 100){//display uploading when progress is between 0 and 100;
//                uploading.innerHTML = 'sharing...'
//            }else if(percentage == 100){
//                uploading.innerHTML = 'sharing complete';
//                setTimeout(()=>{// let progress disappear after 3s
//                    pr.classList.add('d-none');
//                }, 1000)
//            }
//        }
        
//   console.log(xhr);

//        let formData = new FormData(shareForm);
//        xhr.send(formData);
//    }


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


