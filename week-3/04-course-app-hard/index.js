const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

app.use(express.json());


const userSchema = new mongoose.Schema({
  username : String,
  password : String,
  purchasedCourses :[{type:mongoose.Schema.Types.ObjectId, ref: 'Courses'}]
})

const adminSchema = new mongoose.Schema({
  username: String,
  passowrd: String,
  })

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  published: Boolean
});

// Define mongoose models
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

const secrate1 ="SperS3cRat3"
const secrate2 ="N0rmAlS3crAt3"

const authenticateJwtAdmin = (req, res, next)=> {
  const authheader = req.headers.authorization;  
  if (authheader){
    var AuthTokan = authheader.split(" ")[1];    
    jwt.verify(AuthTokan,secrate1,async(err , admin)=>{
      if(err){
        return res.status(403)
      }
      next();     
      }      
    )   
  }
  res.status(403)
}

const authenticateJwtUser = (req,res,next)=>{
  var authheader = req.headers.authorization;
  console.log(authheader)
  if (authheader){
    var AuthTokan = authheader.split(" ")[1];
    jwt.verify (AuthTokan,secrate2,async (err,user)=>{
      if(err){
        return res.status(403);
      }      
        req.user = user;
        next();          
   })
  }
  res.status(403);
}

// mongoose.connect(, {dbName:"Couse"});
mongoose.connect("mongodb+srv://madhavkulkarni1305:rw6s4eysY2CKG9lB@cluster0.7mbyfvf.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


// Admin routes
app.post('/admin/signup', async (req, res) => {
  const newadmin = req.body;
  const username = req.body.username;
  const existingAdmin =  await Admin.findOne({username})
  if (existingAdmin){
    res.status(300).json({message: "Admin alreadyeixst"})
  }else{
      const updateAdmin = Admin(newadmin)
      updateAdmin.save();
      const tokan = jwt.sign({username :username, role:"admin"}, secrate1,{expiresIn: '1h'});
      res.status(200).json({message: "Admin creat dsuccesfully ", tokan: tokan});
  }
  // logic to sign up admin
});

app.post('/admin/login',async (req, res) => {
  const {username,passowrd}=req.headers;
  const existingAdmin = await Admin.findOne({username,passowrd});
  if(existingAdmin){
    const tokan = jwt.sign({username , role: "admin"},secrate1,{expiresIn : '1h'});
    res.status(200).json({message: "Admin login succesful", tokan:tokan})
  }else{
    res.status(300).json({message: "admin doesnot exist"})
  }
  
  // logic to log in admin
});

app.post('/admin/courses', authenticateJwtAdmin, async(req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.status(200).json({message:" Course create dsuccesfully"})

  // logic to create a course
});

app.put('/admin/courses/:courseId',authenticateJwtAdmin, async(req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId,req.body,{new : true})
  if(course){
    res.status(200).json({message:" Course updated dsuccesfully"})
  }else{
    res.status(300).json({message:" Course Not found"})
  }
  // logic to edit a course
});

app.get('/admin/courses',authenticateJwtAdmin, async (req, res) => {
  const courses = await Course.find({});
  res.json({courses})
  // logic to get all courses
});

// User routes
app.post('/users/signup', async(req, res) => {
  const user = req.body;
  const username = user.username
  console.log(username)
  const existingUser= await User.findOne({username});
  console.log(existingUser)
  if (existingUser){
    res.status(300).json({message:" user alrady exist"})
  }else{
    const NewUser = new User(user);
    NewUser.save()
    const tokan = jwt.sign({username, role: "user"},secrate2,{expiresIn: '1h'})
    res.status(200).json({message:" user Created succesfullly",tokan: tokan})
  }
  // logic to sign up user
});

app.post('/users/login', async(req, res) => {
  const {username ,passowrd} = req.headers;
  const existingUser = await User.findOne({username,passowrd});
  if(existingUser){
    const tokan = jwt.sign({username, role:"user"},secrate2,{expiresIn: '1h'})
    res.status(200).json({message:" user logedin succesfullly",tokan: tokan})
  }else{
    res.status(300).json({message:" user Doesnot exist"})
  }
  // logic to log in user
});

app.get('/users/courses',authenticateJwtUser, async(req, res) => {
  const publishedc = await Course.find({published:true})
  console.log(publishedc)
  if(publishedc){
    res.status(200).json({message:" Publishd courses are", publishe: publishedc});
  }else{
    res.json({message:" mo published course found"});
  }
  // logic to list all courses
});

app.post('/users/courses/:courseId',authenticateJwtUser, async (req, res) => {
  const courseId = req.params.courseId;
  console.log(courseId)
  const course = await Course.findById(courseId);
  if (course){
    const username = req.user.username;
    const user = await User.findOne({username});
    if (user){
      user.purchasedCourses.push(course);
      await user.save();
      res.json({message:" course purchased"});
    }else{
      res.json({message:" no such user exist"});
    }
  }else{
    res.json({message:" no such course exist"});
  }
  // logic to purchase a course
});

app.get('/users/purchasedCourses', authenticateJwtUser, async(req, res) => {
  const user = await User.findOne({username: req.user.username}).populate('purchasedCourses');
  if (user){
    res.json({message: " purcaes courses are ", purchasedCourses: user.purchasedCourses || []});
  }else{
    res.json({message: " User not found "});
  }

  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
