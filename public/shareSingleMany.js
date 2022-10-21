let sharingLoader = document.querySelector('.sharing');
let shareBtnFirstText = document.querySelector('.share-btn-first-text');
let shareBtn = document.getElementById('share-btn');
// let uploading = document.querySelector('.uploading');
let shareForm = document.getElementById('share-form');





    shareForm.onsubmit = () =>{
        sharingLoader.classList.remove('d-none');
        shareBtnFirstText.classList.add('d-none');
    }