const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secrate1 ="SperS3cRat3"
const secrate2 ="N0rmAlS3crAt3"

const generateJwtadmin = (admin) =>{
  var payload ={username : admin.username}
  return jwt.sign(payload, secrate1,{expiresIn : "1h"})
}
 const generateJwtUser =(user) => {
  var payload = {username : user.username}
  return jwt.sign(payload,secrate2,{expiresIn:"1h"})
 }

const validatJWTadmin = ()=> {
  var authheader = req.headers.Authentication
  if (authheader){
    var AuthTokan = authheader.split(" ")[1];
    jwt.verify(AuthTokan,secrate1,(err , admin)=>{
      if(err){
        return res.sttaus(403)
      }
      const Admim = ADMINS.find(a => a.username==admin)
      if(Admim){
        req.admin =admin;
        next();    
      }      
    })   
  }
  res.status(403)
}

const validatJWTuser =()=>{
  var authheader = req.headers.Authentication;
  if (authheader){
    var AuthTokan = authheader.split(" ")[1];
    jwt.verify (AuthTokan,secrate2,(err,user)=>{
      if(err){
        return res.status(403);
      }
      const Admim = ADMINS.find(a => a.username==admin)
      if(Admim){
        req.user = user;
        next();   
      } 
      
   })
  }
  res.status(403);
}
 // Admin routes
app.post('/admin/signup', (req, res) => {
  var admin = req.body
  var existingadmin = ADMINS.find(a=> username===a.username && passowrd===a.passowrd);
  if(existingadmin){
    res.status(211).json({message : "Admin already exist"})
  } else{
    ADMINS.push(admin);
    var tokan = generateJwtadmin(admin);
    res.status(200).json({message : "Signup succcesful", Tokan : tokan})
  }// logic to sign up admin
});

app.post('/admin/login', (req, res) => {
  const username = req.headers.username;
  const passowrd = req.headers.passowrd;
  var existingadmin = ADMINS.find(a=> username===a.username && passowrd===a.passowrd);
  if(existingadmin){
    var tokan = generateJwtadmin(admin);
    res.status(2000).json({message : "Admin login succesful", Tokan : tokan})
  } else{
    res.status(400).json({message : "authentication failed"})
  }
  // logic to log in admin
});

app.post('/admin/courses',validatJWTadmin, (req, res) => {
  const course = req.body;
  const CoursId = course.length +1;
  COURSES.push(course);
  res.status(200).json({message : "Course created succesfully", CoursId: CoursId})
  // logic to create a course
});

app.put('/admin/courses/:courseId', validatJWTadmin,(req, res) => {
  const coursID = req.params.courseId;
  const courseindex = COURSES.findIndex(a => a.coursID==course.id)
  if(courseindex>-1){
    const updatedCourse=req.body;
    COURSES[courseindex]=updatedCourse;
    res.status(200).json({message: "Course updated succesfully"})
  }
  else{
    req.status(400).json({message: "invalid coursid"})
  }
  // logic to edit a course
});

app.get('/admin/courses',validatJWTadmin, (req, res) => {
  res.status(200).json({message: "Courses are ", Courses:COURSES})
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  var user = req.body
  var existingUser = USERS.find(a=> username===a.username && passowrd===a.passowrd);
  if(existingUser){
    res.status(211).json({message : "User already exist"})
  } else{
    USERS.push(user);
    var tokan = generateJwtUser(user);
    res.status(200).json({message : "Signup succcesful", Tokan : tokan})  
  }
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  const username = req.headers.username;
  const passowrd = req.headers.passowrd;
  var existingUser = USERS.find(a=> username===a.username && passowrd===a.passowrd);
  if(existingUser){
    var tokan = generateJwtadmin(admin);
    res.status(2000).json({message : "Admin login succesful", Tokan : tokan})
  } else{
    res.status(400).json({message : "authentication failed"})
  }
  // logic to log in user
});

app.get('/users/courses',validatJWTuser, (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
