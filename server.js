const express = require('express');
const app = express();
const { connectToDb, getDb } = require('./db');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const { render } = require('ejs');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const serveIndex = require('serve-index');// serving files
const fs = require('fs');
// const bodyParser = require('body-parser');
// const urlencodedParser = bodyParser.urlencoded({extended: false})
let storage = multer.diskStorage({ dest: 'files',
filename: (req, file, cb)=>{ cb(null, `${file.originalname}`)}})
const upload = multer({dest: 'uploads'});
const upload1 = multer({storage});
//testing file converter
const {mimeType} = require('./mimeTypes');
const { PDFNet } = require('@pdftron/pdfnet-node');

//middleware to serve uploaded files
app.use('/server', 
express.static('uploads'),
serveIndex('uploads', {icons: true}))
//testing if files are found in files folder
app.use('/files', 
express.static('files'),
serveIndex('files', {icons: true}))


//express session middleware
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
}))



const port = process.env.PORT || 8000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use('/bootstrap', express.static(path.join(__dirname, 'bootstrap-5.2.0-dist')));
app.use('/styles', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//home route
app.get('/', (req, res)=>{
  res.render('site', {title: 'Main site'});
})

//registration page route
app.get('/registrationPage', (req, res)=>{
  // this is the info that will be used to populate the fields
req.session.populate = {
  username: req.body.username,
  email: req.body.email,
  password: req.body.password,
  confirmPassword: req.body.confirmPassword
}
let populateInfo = req.session.populate;
  res.render('registration', {header: `http://localhost:${port}/loginPage`, title: 'Registration', populateInfo});
})

let db;
connectToDb((err)=>{
  if(!err){
     app.listen(port, ()=>{
    console.log(`Listenning to server at http://localhost:${port}`);
})
 db = getDb();
}
})






// post route for registration info


app.post('/register', [
  body('email', 'Invalid email').isEmail(),
  body('username', 'Invalid username').isLength({min: 4}),
  body('password').isLength({min: 5}).withMessage('password is weak').custom((value,{req, loc, path})=>{
    if(value !== req.body.confirmPassword){
      throw new Error("Passwords don't match");
    }else{
      return "Enter password";
    }
  })
], async (req, res)=>{
 
// //express validator 
// const errors = validationResult(req);
// if(!errors.isEmpty()){
//   const alert = errors.array();

//   res.render('registration', {title: 'Registration', header: `http://localhost:${port}/loginPage`, alert} )
// }
// //info of registered users
//   const registrationInfo = {
//     username: req.body.username,
//     email: req.body.email,
//     password: await bcrypt.hash(req.body.password, 10),
//     verified: false
//   }


//info of registered users
const registrationInfo = {
  username: req.body.username,
  email: req.body.email,
  password: await bcrypt.hash(req.body.password, 10),
  verified: false
}

// this is the info that will be used to populate the fields
req.session.populateRegistration = {
  username: req.body.username,
  email: req.body.email,
  password: req.body.password,
  confirmPassword: req.body.confirmPassword
}
let populateInfo = req.session.populateRegistration;
//this will be used when verifying the user
req.session.other = registrationInfo;

  
//nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: 587,
  auth: {
    user: 'filesharerapp2022@gmail.com',
    pass: 'yybtqrfbgjuzmypl'
  },
  tls: {
    rejectUnauthorized: false
  }
})

// check if info of new user is found in database 
let users = [];
db.collection('user')
.find()
.forEach(user=>{ users.push(user)})
.then(()=>{
/////////////////////////////////////////////////

// boolean info for email and username
euBooleanInfo = {
  emailTaken: false,
  usernameTaken: false
}
//loop through each document in database
users.forEach(user => {
  if(user.email == registrationInfo.email){
    euBooleanInfo.emailTaken = true;
  }
 if(user.username == registrationInfo.username){
  euBooleanInfo.usernameTaken = true;
  }
});
////////////////////////////////////////////////////////////////
//express validator 
const errors = validationResult(req);
//my validation error object
validationError = {}
if(!errors.isEmpty()){
   validationError.alert = errors.array();
}



///////////////////////////////////////////////////////////////



//render registration page if username or email are in database
let emailTaken = euBooleanInfo.emailTaken;
let usernameTaken = euBooleanInfo.usernameTaken;
let alert = validationError.alert
if(!errors.isEmpty() || euBooleanInfo.emailTaken == true || euBooleanInfo.usernameTaken == true){
  res.render('registration', {title: 'Registration', header: `http://localhost:${port}/loginPage`, emailTaken, usernameTaken, alert, populateInfo} )
}
console.log("debugging code",errors.isEmpty(), euBooleanInfo.emailTaken, euBooleanInfo.usernameTaken)
////////
//add user info into database only if info is valid and not found in database
if(errors.isEmpty() && euBooleanInfo.emailTaken == false && euBooleanInfo.usernameTaken == false){
  db.collection('user')// insert user info into the database
  .insertOne(registrationInfo)
  .then(result=>{
    
    //generate otp code
    let otp = `${Math.floor(1000 + Math.random() * 9000)}`
    req.session.otp = otp;
    //debugging code
    console.log(registrationInfo);

    const mailOptions = {
      from: 'filesharerapp2022@gmail.com',
      to: registrationInfo.email,
      subject: 'FS_app',
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
     </head>
      <body>
      <h1>Confirm Account</h1>
             <p>Enter this code <\p>
             <p style="padding:2rem; background-color:grey; font-size: 2rem; color: white;">${req.session.otp}<\p>
             <p>to verify your account<\p>
             </body>
</html>
            `
    }

req.session.emailSent = false;
    transporter.sendMail(mailOptions, (err, info)=>{
      if(err){
        console.log(err);
        // delete info in database if email is not sent
        db.collection('user')
        .deleteOne({_id: registrationInfo._id})
        .then(result=>{
          console.log('email not sent so file was deleted');
          res.render('registration', {title: 'Registration', header: `http://localhost:${port}/loginPage`, emailSent: req.session.emailSent, populateInfo})

        })
        .catch(err=>{
          if(err) throw err;
          res.send(`<h1>File Not found! :(</h1>`)
        })
      } 
      else{
        console.log("Email sent"+ info.response);
        req.session.emailSent = true;
        // console.log('email check: '+  req.session.emailSent)
     res.redirect('/confirmAccount');
      }
    })
   
  })
  .catch(err=>{
    res.json({Error: err});
  })
}

////////////////////////////////////////////////
})
.catch(err=>{
  if(err){
    res.json({error: "problem with database"})
  }
})




})


// login page route
app.get('/loginPage', (req, res)=>{

  res.render('getLogin', {title: "Login"});
})

// app.get('/getLoginPage', (req, res)=>{

// })
//verification route has been changed to the confirmation 
// this page has been updated
app.get('/confirmAccount', (req, res)=>{
  res.render('confirmAccount', {title:'Confirm Account', emailSent: true});
})


// //user does not have to reach the confirm account page until the email is sent
// function confirmAccountVerification (req, res, next){
//   if(req.session.emailSent == undefined){
//     req.session.emailSent = false;
//     res.redirect('/registrationPage');
//     return;
//   }else if(req.session.emailSent == false){
//     res.redirect('/registrationPage');
//     return;
//   }
//   req.session.emailSent = false;
//   return next();
//   }
  


app.post('/accountConfirmation', (req, res)=>{

if(req.body.verificationCode !== req.session.otp){
  res.render('confirmAccount', {title: 'Confirm Account', invalidCode: true})
return;
}
// console.log('my ver code: '+ req.body.verificationCode+ 'actual code:'+ req.session.otp);
  
db.collection('user')
.updateOne({username: req.session.other.username, password: req.session.other.password}, {$set: {verified: true}})
.then(result2=>{
//nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: 587,
  auth: {
    user: 'filesharerapp2022@gmail.com',
    pass: 'yybtqrfbgjuzmypl'
  },
  tls: {
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: 'filesharerapp2022@gmail.com',
  to: req.session.other.email,
  subject: 'FS_app',
  html: `<h1>Verrified Account</h1>
         <p>Hey ${req.session.other.username}, your account has been verrified successfully
         <a href="${req.headers.origin}/loginPage">Sign in</a></p>
        `
}

transporter.sendMail(mailOptions, (err, info)=>{
  if(err){
    console.log(err);
 
    res.render('getLogin', {title: 'Login', success: false})
  } 
  else{
    res.render('getLogin', {title: 'Login', success: true})
    console.log("Email sent"+ info.response);
  }
})

  
})
.catch(err=>{
  console.log(err);
})
})

// post login info to this route
app.post('/login', (req, res)=>{
    
  let loginInfo = {
    username: req.body.username
  }

  req.session.populateLogin = { // to populate the login fields
    username: req.body.username,
    password: req.body.password
  }
  let populateLogin = req.session.populateLogin;

  db.collection('user')
  .findOne(loginInfo)
  .then(async (result)=>{
    let passwordIsCorrect = await bcrypt.compare(req.body.password, result.password);
    if(passwordIsCorrect == false){
      res.render('login', {err: true, title: 'Login', populateLogin})
      return;
    }
    else if(result.verified == false){
      res.render('login', {title: "Login", notVerified: true, populateLogin})
      return;
    }
    req.session.user = req.body.username;// this is needed to ensure that a user is logged in before he/she can use the 
    req.session.userId = result._id;

        //debugging code
        console.log("session started: "+ JSON.stringify(req.session.user))
        res.redirect('/welcome');
  })
  .catch(err=>{
    res.render('login', {title: 'Login', usernameNotFound: true, populateLogin})
    console.log("username not found in database");
  })
})


//welcome route
app.get('/welcome', logInVerification, (req, res)=>{
  res.render('welcomePage', {title: 'Welcome', uploadOnly: `http://localhost:${port}/uploadOnly`, uploadFileAndShare: `http://localhost:${port}/fileUpload`,username: req.session.user})
})



//route when files are uploaded only
app.get('/uploadOnly', logInVerification, (req, res)=>{
  res.render('uploadOnly', {title: 'File Upload'});
})

//post route when files are uploaded only
app.post('/uploadsOnly', upload.array('files', 12), async (req, res)=>{
  console.log("password" + req.body.password)
let files = [];
  let date = new Date();// to show the date and time when a file was added
let hours = date.getHours();
let mins = date.getMinutes();
let seconds = date.getSeconds();
let millisecs = Math.ceil(date.getMilliseconds()/10)
let day = date.getDate();
let month = date.getMonth();
let year  = date.getFullYear();
let filesInfo = req.files;

console.log(req.files);

 filesInfo.forEach(async (file) => {

  function convertSize () {
    if(file.size <= 999){//keep file size in b
      file.size = file.size + " B";
      console.log(file.size);
      return;
     }else if(file.size > 1000 && file.size <= 999000){//convert to kb
      file.size = Math.round((file.size / 1024) * 10) / 10;
      file.size = file.size + " KB"
      console.log(file.size);
      return;
    }else if(file.size > 1000000 && file.size < 999000000){//convert to mb
      file.size = Math.round((file.size / 1048576) * 10) / 10;
      file.size = file.size + " MB"
      console.log(file.size);
      return;
    }else{
      file.size = Math.round((file.size / 1073741824) * 10) / 10;//convert to gb
      file.size = file.size + " GB"
      console.log(file.size);
      return;
    }
  }
  convertSize();//call function which converts size of file
  let noPassword = req.body.password.length == 0;
  let fileInfo = {
    userId: req.session.userId,
    uploadedBy: req.session.user,
    password: await bcrypt.hash(req.body.password, 10),
    noPassword: noPassword,
    filePath: file.path,
    uploadName: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadDate:  `${day} - ${month} - ${year}`,
    uploadTime: `${hours} : ${mins} : ${seconds}.${millisecs}`
   }
   console.log("one file: "+ JSON.stringify(file));
 files.push(fileInfo)
 
console.log("test files"+ JSON.stringify(files));
console.log(files.length == filesInfo.length)
console.log(fileInfo.size);
if(files.length == filesInfo.length){//testing to see if the files choosen are all in the array

  console.log("files" + files)

  
  db.collection('files')
  .insertMany(files)
  .then(result=>{
 res.render('uploadOnly', {title: 'Upload File',success: true,})

  })
  .catch(err=>{
   res.json({err: 'could not add to db'})
  })

}
});


})

let displayShare = {
  value: false,
  files: null
}
// route gotten when upload button on welcome page is clicked
app.get('/fileUpload', logInVerification, (req, res)=>{
  // console.log('display share: ', req.session.displayShare.value);
//   if(displayShare.value == true && displayShare.files !== null){
//     res.render('uploadFile', {title: 'upload and share', displayShare: displayShare.value, files: displayShare.files});
// return;
//   }
  res.render('uploadFile', {title: 'upload and share'});
  // displayShare.value == false;
  
})

const passwordFieldIsEmpty = {
  value: false
}
// upload info is posted to this url when the upload button in the upload page is clicked
app.post('/upload', upload.array('files', 12), async (req, res)=>{
let receiverEmail =  req.body.email.split(',');//array holding 
console.log(req.body.email);
if(req.body.password == null || req.body.password == ""){
passwordFieldIsEmpty.value = true;
}

let files = [];
  let date = new Date();
let hours = date.getHours();
let mins = date.getMinutes();
let seconds = date.getSeconds();
let millisecs = Math.ceil(date.getMilliseconds()/10)
let day = date.getDate();
let month = date.getMonth();
let year  = date.getFullYear();
let filesInfo = req.files;

//fuction to convert bytes to mb and Gb
// function convertSize (size) {
//   if(size < 1024){//convert to mb
//    let newSize = file.size
//   }else if(size > 1024){//convert to Gb
//    let newSize
//   }
//   return newSize;
// }
// size: file.size,

 filesInfo.forEach(async (file) => {
  function convertSize () {
    if(file.size <= 999){//keep file size in b
      file.size = file.size + " B";
      console.log(file.size);
      return;
     }else if(file.size > 1000 && file.size <= 999000){//convert to kb
      file.size = Math.round((file.size / 1024) * 10) / 10;
      file.size = file.size + " KB"
      console.log(file.size);
      return;
    }else if(file.size > 1000000 && file.size < 999000000){//convert to mb
      file.size = Math.round((file.size / 1048576) * 10) / 10;
      file.size = file.size + " MB"
      console.log(file.size);
      return;
    }else{
      file.size = Math.round((file.size / 1073741824) * 10) / 10;//convert to gb
      file.size = file.size + " GB"
      console.log(file.size);
      return;
    }
  }
  convertSize();//call function which converts size of file
  let noPassword = req.body.password.length == 0;
  let fileInfo = {
    userId: req.session.userId,
    uploadedBy: req.session.user,
    password: await bcrypt.hash(req.body.password, 10),
    noPassword: noPassword,
    filePath: file.path,
    uploadName: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadDate:  `${day} - ${month} - ${year}`,
    uploadTime: `${hours} : ${mins} : ${seconds}.${millisecs}`
   }
   console.log("one file: "+ JSON.stringify(file));
 files.push(fileInfo)
console.log("test files"+ JSON.stringify(files));
console.log(files.length == filesInfo.length)

if(files.length == filesInfo.length){//testing to see if the files choosen are all in the array

  console.log("files" + files)

  // link: `${req.headers.origin}/file/${fileInfo._id}`

  db.collection('files')
  .insertMany(files)
  .then(()=>{


//nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'filesharerapp2022@gmail.com',
    pass: 'yybtqrfbgjuzmypl'
  },
  tls: {
    rejectUnauthorized: false
  }
})
let mssgs = [];//array containing files to be sent through email
let links = [];//array containing links to be displayed when file is uploaded

files.forEach(file => {
  let link = `${req.headers.origin}/file/${file._id}`
  let mssg = `<li>${file.originalName} - <a href="${req.headers.origin}/file/${file._id}">download</a></li><br>`
  mssgs.push(mssg);
  links.push(link);
});

displayShare.files = files;
console.log("files: "+ JSON.stringify(files))
console.log("mssgs: "+ mssgs)

const mailOptions = {
  from: 'filesharerapp2022@gmail.com',
  to: receiverEmail,
  subject: 'File(s) Received',
  html: `<h1 style="font-size: 1.3rem;">FS_app: Shared File(s)</h1>
        <p style="font-size: 1.1rem;">Hello! You received a package from <span style="font-weight:bold;">${req.session.user}</span></p>
        <ul style="font-size: 1.1rem; padding: 1rem;">
         ${mssgs}
         </ul>
         <div style="font-size: 1.1rem;"> With FS_app, you can share files with 
        anyone, anywhere, and at anytime without limits.<br><br> If you would like to use Fs_app,
        click <a href="${req.headers.origin}/registrationPage">here</a> to sign up.</div>
        `
}

req.session.emailSent2 = false;
transporter.sendMail(mailOptions, (err, info)=>{
  if(err){
    console.log(err);
    console.log('files to be delted: '+ JSON.stringify(files));
    // if email is not sent when files are uploaded then delete the files from database
   files.forEach(file => {


    fs.unlink(file.filePath, (err)=>{//delete files from server
      if(err) console.log(err);
      else{
        console.log('file deleted from server');
      }
      
    })

    db.collection('files')
    .deleteOne({_id: ObjectId(file._id)})
    .then(result=>{
      console.log('email not sent so files were deleted from db');
    })
    .catch(err=>{
      if(err) console.log(err);
    })
  

   });
    res.render('uploadFile', {title: 'Upload File', success: false, links});

  } 
  else{
 
    res.render('uploadFile', {title: 'Upload File', success: true, links});
    console.log("Email sent"+ info.response);

  }
})

  })
  .catch(err=>{
   res.json({err: err})
  })

}
});

   

})


const fileLocked = {//object for file
  value: true,
  authenticatedUser: false
}
// this route is gotten when the link is clicked
// this is the download route
app.get('/file/:id', (req, res)=>{
  if(req.session.user !== undefined){//check if the person downloading is logged in
    fileLocked.authenticatedUser = true;
  }else if(req.session.user == undefined){
    fileLocked.authenticatedUser = false;
  }
  // this is to check if the file has a password so that if it doesn't,
  // the password field will be removed
  // console.log('you just entered the download route')

  // db.collection('files')
  // .findOne({_id: ObjectId(req.params.id)})
  // .then(async (result)=>{
  //   if(result !== {}){
  //     fileLocked.filePath = result.filePath;// filepath and original name are
  //   fileLocked.originalName = result.originalName;//here in order to be able to download files which have no password
  //     console.log('searching database');
  //   let noPassword = await bcrypt.compare("", result.password);
  //   console.log("no password", noPassword);
  //   if(noPassword){
  //     res.render('download', {title: "Download", noPassword: true});
  //    fileLocked.value = false;//to show if file is locked or not
  //     console.log("fileLocked.value", fileLocked.value);
  //   }else if(noPassword == false){
  //     res.render('download', {title: "Download", noPassword: false})
  //     fileLocked.value = true;//to see if the file has a password
  //     console.log("there is a password")
  //   }
  //   }else{
  //     res.render('download', {title: "Download", fileNotFound: true})

  //   }

  // })
  // .catch(err=>{
  //   console.log('catch')
  //   res.render('download', {title: 'Download', fileNotFound: true})
  // })
  db.collection('files')
  .findOne({_id: ObjectId(req.params.id)})
  .then(async (result)=>{
    if(result !== {}){
    let noPassword = await bcrypt.compare("", result.password);//check if file has no password
     console.log('searching database');

    if(noPassword == true){
      fileLocked.value = false;
      fileLocked.filePath = result.filePath;// filepath and original name are
      fileLocked.originalName = result.originalName;//here in order to be able to download files which have no password
      res.render('download', {title: "Download", passwordIsInvalid: false, noPassword: true, authenticatedUser: fileLocked.authenticatedUser})
    }else if(noPassword == false){
      fileLocked.value = true;
      res.render('download', {title: "Download", passwordIsInvalid: false, noPassword: false, authenticatedUser: fileLocked.authenticatedUser})
    }
    }else{
      res.send('No file')
    }
  })
  .catch(err=>{
    res.render('download', {title: 'Download', fileNotFound: true, authenticatedUser: fileLocked.authenticatedUser})
  })
})

// download info is posted to this route when the download button in the download page is clicked
app.post('/file/:id', (req, res)=>{
//   console.log('download post route')
// console.log("fileLocked.value", fileLocked.value);
//  if(fileLocked.value == false){
//   res.download(fileLocked.filePath, fileLocked.originalName);
//   return;
//  }
if(req.session.user !== undefined){//check if the person downloading is logged in
  fileLocked.authenticatedUser = true;
}else if(req.session.user == undefined){
  fileLocked.authenticatedUser = false;
}
if(fileLocked.value == false){//check if the file has a password, then download
  res.download(fileLocked.filePath, fileLocked.originalName);
return;
}

  db.collection('files')
  .findOne({_id: ObjectId(req.params.id)})
  .then(async (result)=>{
    if(result !== {}){
    let passwordIsCorrect = await bcrypt.compare(req.body.password, result.password);
    // let noPassword = await bcrypt.compare("", result.password);//check if file has no password
     
    if(passwordIsCorrect){
      res.download(result.filePath, result.originalName);
    }else{
      res.render('download', {title: "Download", passwordIsInvalid: true, noPassword: false, authenticatedUser: fileLocked.authenticatedUser})
    }
    }else{
      res.send('No file')
    }
  })
  .catch(err=>{

    res.render('download', {title: 'Download', fileNotFound: true, authenticatedUser: fileLocked.authenticatedUser})
  })
})


// //share page route
// app.get('/share', logInVerification, (req, res)=>{
//   res.render('share', {title: 'Share'});
// })



// //post the shared file link
// app.post('/share', (req, res)=>{
   
//   const shareInfo = {
//     email: req.body.email,
//     link: req.body.downloadPage
//   }
  
// //nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'achaleebotoma2002@gmail.com',
//     pass: 'jhoxlbxfdqzaqgww'
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// })

// const mailOptions = {
//   from: 'achaleebotoma2002@gmail.com',
//   to: shareInfo.email,
//   subject: 'Shared File',
//   html: `<p>Click this link<\p>
//          <a href="${shareInfo.link}">${shareInfo.link}<\a>
//          <p>to download file<\p
//         `
// }


// transporter.sendMail(mailOptions, (err, info)=>{
//   if(err) console.log(err);
//   else{
//     res.render('share', {success: true, title: "Share"});
//     console.log("Email sent"+ info.response);
//   }
// })

// })


//logout route
app.get('/logout', (req, res)=>{
  req.session.populateLogin = { // to populate the login fields
    username: req.body.username,
    password: req.body.password
  }
  let populateLogin = req.session.populateLogin;
  res.render('login', {title: 'Login', populateLogin})

  req.session.destroy((err)=>{
  if(err) console.log(err);
  console.log('session destroyed');  
  })
 
})


//middleware functions to ensure that user must be logged in to use application
function logInVerification (req, res, next){
if(req.session.user == undefined){
  res.redirect('/loginPage');
  return;
}
return next();
}


// route to show uploaded files
app.get('/myUploads', logInVerification, (req, res)=>{
  let files = [];
  db.collection('files')
  .find({uploadedBy: req.session.user})
  .forEach(file =>{ files.push(file)})
  .then(()=>{
    console.log('files: '+ JSON.stringify(files));
    // console.log('file id: '+ files[0]._id)
    console.log(files !== []);
    res.render('myUploads', {title: 'My Uploads', files, port})
  })
  .catch(err=>{
    if(err) console.log(err)
    else{
      res.json({error: 'problem with database'})
    }
  })
})


//delete route to delete uploaded files
app.get('/delete/:id', logInVerification, (req, res)=>{
  console.log(req.params.id);
  db.collection('files')
  .findOne({_id: ObjectId(req.params.id)})
  .then(result =>{
    fs.unlink(result.filePath, (err)=>{//delete file from server
      if(err) console.log(err);
      console.log('File deleted');
      //delete file info from database
      db.collection('files')
      .deleteOne({_id: ObjectId(req.params.id)})
      .then(result=>{
        console.log('file deleted from database successfully');
        res.redirect('/myUploads')
      })
      .catch(err=>{
        if(err) throw err;
        res.json({err: "file not found!"})
      })
    })
  })
})


// //delete route to delete uploaded files to be shared
// app.get('/delete-before/:id', logInVerification, (req, res)=>{
//   console.log(req.params.id);
//   db.collection('files')
//   .findOne({_id: ObjectId(req.params.id)})
//   .then(result =>{
//     fs.unlink(result.filePath, (err)=>{//delete file from server
//       if(err) console.log(err);
//       console.log('File deleted');
//       //delete file info from database
//       db.collection('files')
//       .deleteOne({_id: ObjectId(req.params.id)})
//       .then(result=>{
//         console.log('file deleted from database successfully');
//         displayShare.value = true;
//         res.redirect('/fileUpload');
        
//       })
//       .catch(err=>{
//         if(err) throw err;
//         res.json({err: "file not found!"})
//       })
//     })
//   })
// })


//single sharefile route
app.get('/share-file-page/:id', logInVerification, (req, res)=>{
let id = req.params.id;
  db.collection('files')
  .findOne({_id: ObjectId(req.params.id)})
  .then(async (result)=>{
    if(result !== {}){
      req.session.shareSingleInfo = {//single file info which will be used for the email
        originalName: result.originalName,
        id: id
       }
      res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`, id: req.session.shareSingleInfo.id})
    
    
    }else{
      res.send('No file')
    }
  })
  .catch(err=>{

    res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`})
  })
 
})



//route for sharing a single file from the uploads page
app.post('/share-file-page/:id', async(req, res)=>{
  let receiverEmail = req.body.email.split(',');//array holding 
//get email to use when checking if the user the files have been sent to is an FSApp user
req.session.senderEmail = req.body.email;

console.log(1, req.session.senderEmail, req.session.emailIsFound, req.session.emailCheckerMssg);


//sdfre search database for receiver's email
await db.collection('user')
.findOne({email: req.session.senderEmail})
.then((result)=>{
  console.log(2, result);
if(result !== null){//if the email is found

console.log(6, req.body.email, req.body.singleFile, req.params.id);
console.log(7, req.session.senderEmail, req.session.emailIsFound, req.session.emailCheckerMssg);

  //nodemailer
const transporter = nodemailer.createTransport({
service: 'gmail',
secure: 587,
auth: {
  user: 'filesharerapp2022@gmail.com',
  pass: 'yybtqrfbgjuzmypl'
},
tls: {
  rejectUnauthorized: false
}
});

const mailOptions = {
from: 'filesharerapp2022@gmail.com',
to: receiverEmail,
subject: 'FS_app',
html: `<h1 style="font-size: 1.3rem;" >FS_app: Shared File</h1>
       <p style="font-size: 1.1rem;" >Hello, You received a package from <span style="font-weight:bold;">${req.session.user}</span>
       <p style="font-size: 1.1rem;">${req.session.shareSingleInfo.originalName} - <a href="${req.headers.origin}/file/${req.params.id}">download</a></p>
       </p>
       <div style="font-size: 1.1rem;">You don't have an Fs_app account?<br><br> With FS_app, you can share files with 
        anyone, anywhere, and at anytime without limits.<br><br> If you would like to use Fs_app,
        click <a href="${req.headers.origin}/registrationPage">here</a> to sign up.</div>
      `
}


db.collection('files')
.findOne({_id: ObjectId(req.params.id)})
.then(async (result)=>{
  if(result !== null){
  
    transporter.sendMail(mailOptions, (err, info)=>{
      if(err){
        console.log(err);
     
        res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`, success: false, id: req.params.id})
      } 
      else{
        res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`, success: true, id: req.params.id})
        console.log("Email sent"+ info.response);
      }
    })
  
  
  }else{
    res.render('shareSingle', {title: 'Share', success: false, link: `http://localhost:${port}/file/${req.params.id}`, id: req.params.id})

  }
})
.catch(err=>{

  res.render('shareSingle', {title: 'Share', success: false, link: `http://localhost:${port}/file/${req.params.id}`, id: req.params.id})
})





}else if(result == null){//if the email is not found
 req.session.emailIsFound = false;
 console.log(4, 'file sent to unauthorized user', result);
 

 console.log(6, req.body.email, req.body.singleFile, req.params.id);
 console.log(7, req.session.senderEmail, req.session.emailIsFound, req.session.emailCheckerMssg);

   //nodemailer
const transporter = nodemailer.createTransport({
 service: 'gmail',
 secure: 587,
 auth: {
   user: 'filesharerapp2022@gmail.com',
   pass: 'yybtqrfbgjuzmypl'
 },
 tls: {
   rejectUnauthorized: false
 }
});

const mailOptions = {
 from: 'filesharerapp2022@gmail.com',
 to: receiverEmail,
 subject: 'FS_app',
 html: `<h1 style="font-size: 1.3rem;">FS_app: Shared File</h1>
        <p style="font-size: 1.1rem;">Hey! You have a package from ${req.session.user}:
        <p style="font-size: 1.1rem; padding: 2rem;"> - ${req.session.shareSingleInfo.originalName} - <a href="${req.headers.origin}/file/${req.params.id}">download</a></p>
        </p>
        <div style="font-size: 1.1rem;">You don't have an Fs_app account?<br><br> With FS_app, you can share files with 
        anyone, anywhere, and at anytime without limits.<br><br> If you would like to use Fs_app,
        click <a href="${req.headers.origin}/registrationPage">here</a> to sign up.</div>
       `
}

//search database for ids to use and check if the file is in db when email is not in db
 db.collection('files')
 .findOne({_id: ObjectId(req.params.id)})
 .then(async (result)=>{
   if(result !== null){
   
     transporter.sendMail(mailOptions, (err, info)=>{
       if(err){
         console.log(err);
      
         res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`, success: false, id: req.params.id})
       } 
       else{
         res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`, success: true, id: req.params.id})
         console.log("Email sent"+ info.response);
       }
     })
   
   
   }else{
     res.render('shareSingle', {title: 'Share', success: false, link: `http://localhost:${port}/file/${req.params.id}`, id: req.params.id})

   }
 })
 .catch(err=>{

   res.render('shareSingle', {title: 'Share', success: false, link: `http://localhost:${port}/file/${req.params.id}`, id: req.params.id})
 })




}
})//sdfre ends here
.catch(err=>{
  if(err) console.log(5, err);
  res.render('shareSingle', {title: 'Share', success: false, link: `http://localhost:${port}/file/${req.params.id}`, id: req.params.id})

})


})

//post route containing inputs from my uploads table

app.post('/share-many-files', (req, res)=>{


  // let newArr = JSON.parse(req.body.inputsArr);
  let filesToBeShared = req.body.inputsArr.split(',');//array containing file ids
  
  console.log('files to be shared: '+ filesToBeShared);
  let sharableLinks = [];
  let sharableIds = [];
  filesToBeShared.forEach(file => {
    let link = `${req.headers.origin}/file/${file}`
    sharableLinks.push(link);
    sharableIds.push(file);
    console.log('pushed');
  });
 
console.log('links : '+ sharableLinks);
req.session.sharableLinks = sharableLinks;
req.session.sharableIds = sharableIds;
res.end();

})


//route to get sharable links
app.get('/get-share-many', logInVerification,(req, res)=>{
  console.log('gettting')
res.render('shareMany', {title: "share many", links:  req.session.sharableLinks});
});



app.post('/post-share-many', (req, res)=>{//post route for sharing files through email
  let receiverEmail = req.body.email.split(',');//array holding 


let objectIds = [];//array of object ids

req.session.sharableIds.forEach(id => {//push each object id into array
  objectIds.push(ObjectId(id));
});



//array to keep original name
req.session.sharableOrigName = []
let shareArrInfo = []; //contains the info of the files to be shared



//email first part
    //nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: 587,
      auth: {
        user: 'filesharerapp2022@gmail.com',
        pass: 'yybtqrfbgjuzmypl'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    



  db.collection('files')
.find({_id: {$in: objectIds}})
.forEach(file =>{ shareArrInfo.push(file)})
.then(() =>{
  
  let shareMssgs = [];//contains messages to be sent through email

  shareArrInfo.forEach(info => {//push originalName of file into array
    req.session.sharableOrigName.push(info.originalName);
    let mssg =  `<li>${info.originalName} - <a href="${req.headers.origin}/file/${info._id}">download<a></li><br>`
   shareMssgs.push(mssg);
  });

  const mailOptions = {
    from: 'filesharerapp2022@gmail.com',
    to: receiverEmail,
    subject: 'FS_app',
    html: `<h1 style="font-size: 1.1rem;">FS_app: Shared file(s)</h1>
           <p style="font-size: 1.1rem;">Hey! You have a package from ${req.session.user}:
           </p>
           <ul style="font-size: 1.1rem; padding: 1rem;">
           ${shareMssgs}
           </ul>
           <div style="font-size: 1.1rem;">You don't have an Fs_app account?<br><br> With FS_app, you can share files with 
           anyone, anywhere, and at anytime without limits.<br><br> If you would like to use Fs_app,
           click <a href="${req.headers.origin}/registrationPage">here</a> to sign up.</div>          `
  }
  


transporter.sendMail(mailOptions, (err, info)=>{
  if(err){
    console.log(err);
 console.log('email not sent');
 res.render('shareMany', {title: 'Share Many',links:  req.session.sharableLinks, success: false})

  } 
  else{
    console.log("Email sent"+ info.response);
    res.render('shareMany', {title: 'Share Many',links:  req.session.sharableLinks,success: true})

  }
})
   console.log('shareArrInfo: '+ JSON.stringify(shareArrInfo));
})
.catch(err=>{
  res.json({err: "error"});
})

})




// a route to delete many files
app.post('/delete-many-files', (req, res)=>{
  let filesToBeDeleted = req.body.inputsArr.split(',');//array containing file ids
console.log('files to be deleted: '+ filesToBeDeleted);
//convert file ids into object ids and push them into a new array
let newArrDelete = [];// array holding object ids used to search files in db
filesToBeDeleted.forEach(file => {
  newArrDelete.push(ObjectId(file));
});

let searchDelete = []; //array holding file info for deleting files;
db.collection('files')
.find({_id: {$in: newArrDelete}})
.forEach(file =>{ searchDelete.push(file)})
.then(() =>{

  // console.log("file info of delete: "+ JSON.stringify(searchDelete));
 searchDelete.forEach(file => {//loop through searchdelete array
  
  fs.unlink(file.filePath, (err)=>{//delete file from server
    if(err) console.log(err);
    console.log('File deleted');
    //delete file info from database
    db.collection('files')
    .deleteOne({_id: ObjectId(file._id)})
    .then(result=>{
      console.log('file deleted from database successfully');
   
    })
    .catch(err=>{
      if(err) throw err;
      res.json({err: "file not found!"})
    })
  })
 });
 res.redirect('/myUploads')
})
})





//test route to convert files from docx to pdf
// app.get('/files', (req, res)=>{
//   const inputPath = path.resolve(__dirname, 'files');
//   fs.readdir(inputPath, function(err, files){
//     if(err){
//       return console.log('Unable to scan directory: ' + err);
//     }
//     res.setHeader('Content-Type', mimeType['.json']);
//     res.end(JSON.stringify(files));
//   })
// })


// app.get('/files/:filename', (req, res)=>{
//   const inputPath = path.resolve(__dirname, filesPath, req.params.filename);
//   fs.readFile(inputPath, function(err, data){
//     if(err) {
//       res.statusCode = 500;
//       res.end(`Error getting the file: ${err}.`);
//     }else{
//       const ext = path.parse(inputPath).ext;
//       res.setHeader('Content-Type', mimeType[ext] || 'text/plain');
//       res.end(data);
//     }
//   })
// })

app.get('/convertFromOffice', logInVerification, (req, res)=>{
  res.render('convertToPdf', {title: 'convert'});
})

app.post('/convertFromOffice', upload1.single('file'), (req, res)=>{
let file = req.file;
console.log(JSON.stringify(file));

  // db.collection('files')
  // .findOne({uploadName: req.params.filename})
  // .then(async (result)=>{
  //   if(result !== null){
  //     req.session.convertInfo = {
  //       originalName: result.originalName,
  //       id: result._id
  //      }
    
      
     
  

  //   }else{
  //     res.send('No file')
  //   }
  // })
  // .catch(err=>{

  //   res.render('shareSingle', {title: 'Share', link: `http://localhost:${port}/file/${req.params.id}`})
  // })



  const inputPath = path.resolve(file.destination, file.originalname);
  const outputPath = path.resolve(file.destination, `${file.originalname}.pdf`);

  const convertToPdf = async () =>{
    const pdfdoc = await PDFNet.PDFDoc.create();
    await pdfdoc.initSecurityHandler();
    await PDFNet.Convert.toPdf(pdfdoc, inputPath);
    pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized,);
  };

  PDFNet.runWithCleanup(convertToPdf, "demo:1666744513958:7ad7d27c0300000000a1c5d134abd70a226183a09a798fec3a5123d64d").then(()=>{
  fs.readFile(outputPath,(err, data)=>{
    if(err){
      res.statusCode = 500;
      console.log(1)
      res.end(err);
    }else{
      // res.setHeader('Content-Type', 'application/pdf');
      console.log(2);
      let arr = file.originalname.split('.');
      res.download(outputPath, `${arr[0]}.pdf`, ()=>{
    //delete converted file and file to be converted after it is downloaded
    fs.unlink(outputPath, (err)=>{
      if(err) console.log(err);
    console.log("pdf file deleted");
    })
    fs.unlink(inputPath, (err)=>{
      if(err) console.log(err);
      console.log("file deleted");
    })
      });
  
    }
  })
  }).catch(err=>{
    res.statusCode = 500;
    console.log(3)
    res.end(JSON.stringify(err));
  })








})