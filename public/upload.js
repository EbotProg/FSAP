let form = document.getElementById('form');
let fileInput = document.getElementById('files');
let addFileBtn = document.getElementById('add-file');
let progress = document.querySelector('progress');
let progressIndicator = document.querySelector('.progress-percentage');
let pr = document.querySelector('.pr');
// let cancelBtn = document.getElementById('cancel-btn');
let uploading = document.querySelector('.uploading');



addFileBtn.onclick = e => {
    if(fileInput.value == ""){
        return;
    }
    console.log('fileinput value: ', fileInput.value);
 console.log('button clicked')
    //ajax pst request to the server
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'uploadsOnly', true);


    //progress function
    xhr.upload.onprogress = e =>{
        // cancelBtn.classList.remove('disabled');
        pr.classList.remove('d-none');
        let percentage = Math.round((e.loaded/e.total)*100);
        progress.value = percentage;
        progressIndicator.innerHTML = percentage + ' %'
        console.log(e.loaded, e.total);
        if(percentage >= 0 && percentage < 100){//display uploading when progress is between 0 and 100;
            uploading.innerHTML = 'uploading...'
            // cancelBtn.classList.remove('disabled');

        }else if(percentage == 100){
            // cancelBtn.classList.add('disabled');
            uploading.innerHTML = 'upload complete';
            setTimeout(()=>{// let progress disappear after 3s
                pr.classList.add('d-none');
            }, 1000)
        }
    }
    let formData = new FormData(form);
 
    xhr.send(formData);
}



// cancelBtn.onclick = () =>{
// window.location.reload(); 

// }





