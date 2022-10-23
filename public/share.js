


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