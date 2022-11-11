
    //for the success message to disappear after some seconds
    let verSuccessAlert = document.getElementById('verification-success-alert');
    let passSuccessAlert = document.getElementById('password-success-alert');
  function hideSuccess(){
    if(verSuccessAlert !== null){
        setTimeout(()=>{
        verSuccessAlert.classList.add('d-none');
        }, 6000)
    }
    if(passSuccessAlert !== null){
        setTimeout(()=>{
        passSuccessAlert.classList.add('d-none');
        }, 6000)
    }
  }
   
  hideSuccess();




const copyBtns = document.querySelectorAll('.copyBtn');
const routes = document.querySelectorAll('.route');
const mssgs = document.querySelectorAll('.message');


// to load when he sign up page is loaded
let signUpLoader = document.querySelector('.signing-up');
let signUpBtn = document.getElementById('reg-submit');
let regForm = document.getElementById('reg-form');






console.log(copyBtns, routes);




    copyBtns.forEach((copyBtn, index) => {

    copyBtn.addEventListener('click', ()=>{
      mssgs[index].style.display = "flex";
      console.log(index, routes[index]);
      navigator.clipboard.writeText(routes[index].href);// copy the href of the file
      setTimeout(()=>{
      mssgs[index].style.display = "none";
      }, 1000)
    })
           
        
    });


// make form not to clear when submitted
// const form = document.querySelector('form');
// form.addEventListener('submit', (event)=>{
//   event.preventDefault();
// })
    
// This code is for the scrolling effect on the nav items
let getStartedPage = document.getElementById('get-started');
let getStartedlink = document.getElementById('get-started-nav-item');
let howToUseLink = document.getElementById('how-to-use-nav-item');
window.onscroll = () =>{

  if(document.documentElement.scrollTop < 700){
    getStartedlink.classList.add('active')
    howToUseLink.classList.remove('active')
  }else if(document.documentElement.scrollTop > 700){
    getStartedlink.classList.remove('active')
howToUseLink.classList.add('active');
  }
  
}

/// registration page code

//function for removing the spaces in the username
// function trimFunction () {
//   const username = document.getElementById('username');
//   let oldValue = username.value;
//   let newValue = oldValue.split(" ").join("");
//   console.log(newValue);
//   username.value = newValue;
// }

// this code is here to make the sign up button to be disabled after 10s
const regSubmitBtn = document.getElementById('reg-submit');
const signInSubmitBtn = document.getElementById('sign-in-submit');
function disableBtn() {
  
  regSubmitBtn.classList.add('disabled');
   regSubmitBtn.style.backgroundColor = '#502050';
   regSubmitBtn.style.color = '#fff';
  signUpLoader.classList.remove('d-none');
  console.log('clicked')
}
function signInLoader() {
  
  signUpLoader.classList.remove('d-none');
  console.log('clicked')
}




// this code is to confirm the deletion of a file

function deleteChecker() {
  let result = confirm('Warning!!!\nThe file you have chosen will be deleted');
  if(result == false){
    event.preventDefault();
  }
}

 document.querySelectorAll('.whole-content')[1].style.visibility = 'hidden';
       document.querySelectorAll('.whole-content')[0].style.visibility = 'hidden';

  //these lines of code are to run when the main site is loading
  document.onreadystatechange = function () {
    let state = document.readyState;
    
    if(state == 'loading'){
      document.querySelectorAll('.whole-content')[1].style.visibility = 'hidden';
       document.querySelectorAll('.whole-content')[0].style.visibility = 'hidden';

    }
    if(state == 'interactive'){
      document.querySelectorAll('.whole-content')[1].style.visibility = 'hidden';
       document.querySelectorAll('.whole-content')[0].style.visibility = 'hidden';

    }
    else if(state == 'complete'){
      setTimeout(()=>{
      document.getElementById('load').style.visibility = 'hidden';
      document.querySelectorAll('.whole-content')[0].style.visibility = 'visible';
      document.querySelectorAll('.whole-content')[1].style.visibility = 'visible';

      }, 1000)
    }
  }










    // signUpBtn.onclick = () =>{
    //     signUpLoader.classList.remove('d-none');
    //     signUpBtnFirstText.classList.add('d-none');
    //     console.log('clicked')
    // }