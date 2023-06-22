import Admin from '../models/admin.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// @desc   Get Login form page
// @route  GET process.env.ADMIN_ROUTE/login
// @access Public
export const getLoginForm = async (req,res,next)=>{
  res.render('admins/login');
} 

// @desc   Login admin account and create token
// @route  POST process.env.ADMIN_ROUTE/login
// @access Public
export const login = async (req,res,next) => {
  try{
    const admin = await Admin.findOne({email: req.body.email})
    
    // check if admin is exist or the hashed password is right or not
    if(!admin || !(await bcrypt.compare(req.body.password, admin.password))){
      return res.status(403).render('admins/login',{errorMessage:"Wrong email or password"})
    }
  
    // create token when login success
    const token = jwt.sign({adminId:admin.id},process.env.JWT_SECRET_KEY,{
      expiresIn:process.env.JWT_EXPIRE_TIME
    })
    req.session.token = token;
  
    res.redirect('/');
  }catch(err){
    let errorMessages = [];

    if (err.errors) {
      for (let errorMessage of Object.values(err.errors).map(val => val.message)) {
        errorMessages.push(errorMessage);
      }
    }
    const tempMessage = "Can't create a token to login, Please try again...";
    if (!errorMessages.length) {
      errorMessages[0] = tempMessage;
    }
    next(new ApiError(errorMessages[0], 502, 'admins/login', { errorMessages }));
  }
}

// @desc   Logout admin account
// @route  POST process.env.ADMIN_ROUTE/logout
// @access Public
export const logout = (req,res,next) => {
  delete req.session.token;
  res.redirect('/');
}