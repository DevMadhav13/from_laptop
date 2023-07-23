const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const autenticationadmin = (req ,res ,next)=>{
  const username = req.headers.username;
  const password = req.headers.password;
  const admin = ADMINS.find(a => a.username=== username && a.password === password);
  if (admin){
    next()
  }else{
    res.status(403).json({ message : "Bad credentials"})
  }
}
 
// const autenticationUser = (req ,res ,next)=>{
//   console.log("inside auth user")
//   const user = {
//     username : req.headers.username,
//     password : req.headers.password,
//    };
//    console.log("from Auth user "+user);
//   const User = USERS.find(a => a.username=== user.username && a.password === user.password);
//   if (User){
//     // req.user = user;
//     next()
//   }else{
//     res.status(403).json({ message : "Bad credentials"})
//   }
// }

const autenticationUser = (req ,res ,next)=>{
  const user={
    username : req.headers.username,
    password : req.headers.password,
    }
  const User = USERS.find(a => a.username===user.username && a.password === user.password);
  if (User){
    req.user = User;
    next()
  }else{
    res.status(403).json({ message : "Bad credentials"})
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin = req.body;
  const alreadyadmin = ADMINS.find(a => a.username=== admin.username && a.password === admin.password);
  if (alreadyadmin){
    res.status(411).json({ message : "Admin already eist"})
  }else{
    ADMINS.push(admin);
    res.status(200).json({ message : "admin created succesfully"})
  }

  // logic to sign up admin
});

app.post('/admin/login', autenticationadmin ,(req, res) => {
  console.log("inside login route")
  
  res.status(200).json({Message : "admin logi succesful"})
  // logic to log in admin
});

app.post('/admin/courses', autenticationadmin,(req, res) => {
  const course = req.body;
  const courseexist = COURSES.find(a => a.title===course.title && a.id === course.id);
  if(courseexist){
    res.status(422).json({Message: "course already exist"})
  }else{
    course.id = Date.now();
    COURSES.push(course);
    res.status(200).json({message: "Course created succesfully", courseid: course.id })
  }


  // logic to create a course
});

function courseIndex(courseID){
    for(i=0;i<COURSES.length;i++){
    if(COURSES[i].id==courseID){
      return i;
    }}
    return -1;
 }
app.put('/admin/courses/:courseId',autenticationadmin, (req, res) => {
  var UpdatedCourse = req.body;
   var courseID = parseInt(req.params.courseId);
   var Cindex = courseIndex(courseID)
  console.log("Cindex back"+Cindex);
  if(Cindex!==-1){
    console.log(COURSES[Cindex])
    Object.assign(COURSES[Cindex], UpdatedCourse);
    res.status(200).json({message: "Course edited sccesfully", Courseid: courseID})
  }else{
    res.status(410).json({message: " Courseid Is invalid"})
  }
  

  // logic to edit a course
});

app.get('/admin/courses',autenticationadmin, (req, res) => {
  res.status(200).json(COURSES);
  // logic to get all courses
});



// User routes
app.post('/users/signup', (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchaedCourses:[]
  };
  var existignuser = USERS.find(a => a.username===user.username && a.password===user.password);
  if (existignuser){    
    console.log("------------USERS-----------");
      console.log(USERS);
      res.status(300).json({message : "User already exist"});
  }else{
    console.log(user)
    USERS.push(user)
    // console.log(user);
    res.status(200).json({message: "user added succesfully"})
  }
  // logic to sign up user
});

app.post('/users/login', autenticationUser, (req, res) => {
  console.log(req.user);
  // var num =13;
  // var num = {name: "madhav",date:"13"};
// console.log(req.user.purchaedCourses)
  // req.user.purchaedCourses.push(num);
  console.log(req.user);
  res.status(200).json({message: "user loged in succesfully"});
  // logic to log in user
});



var filteredCourses=[];
app.get('/users/courses',autenticationUser, (req, res) => {
  console.log(filteredCourses);
  for (i=0;i<COURSES.length;i++){
    if (COURSES[i].published==true){
      filteredCourses.push(COURSES[i]);
    }
   }
   res.status(200).json({message: "purchaeed urses are ", courses: filteredCourses})
  // logic to list all courses
});

app.post('/users/courses/:courseId', autenticationUser,(req, res) => {
  var courseId = parseInt(req.params.courseId);
  console.log(filteredCourses)
  console.log("filteredCourses.length"+filteredCourses.length)
  console.log("courseId"+courseId)
    for (i=0;i<filteredCourses.length;i++){
      console.log("filteredCourses[i].id "+ filteredCourses[i].id)
      console.log("filteredCourses[i].id==courseId"+ filteredCourses[i].id==courseId)
      if(filteredCourses[i].id==courseId){
        req.user.purchaedCourses.push(filteredCourses[i]);
        console.log("-----------------------------------------")
        console.log("req.user.purchaedCourses "+ req.user.purchaedCourses)
        res.status(200).json({Message: "Curse puchased succesfully"})
      }
      else{
        res.status(400).json({message: "Course not published, invalid course id"})
      }
  }    
    // logic to purchase a course
});

app.get('/users/purchasedCourses',autenticationUser, (req, res) => {
  res.status(200).json({message: " Purhaed courses are ", courses: USERS})
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
