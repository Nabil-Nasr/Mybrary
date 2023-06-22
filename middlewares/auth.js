import Admin from "../models/admin.js";
import { ApiError } from "../utils/api-error.js";
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;
  if (req.session.token) {
    ({ token } = req.session);
  }

  // if the admin is logged out the user can't access the page
  if (!token && req.method === "GET") {
    return next(new ApiError("Not found", 404));
  }

  // if the method not GET the user doesn't have permissions
  if (!token) {
    req.session.errorMessage = "You don't have admin permissions";
    return res.status(401).redirect('/');
  }

  const verificationMessage = await verifyToken(req,res,token,{checkAdminExistence:false});
  if(verificationMessage != "success"){
    return;
  }

  next();
};

export const checkAdmin = async (req, res, next) => {
  let token;
  if (req.session.token) {
    ({ token } = req.session);
  }

  // if the method not GET the user doesn't have permissions
  if (token) {
    const verificationMessage = await verifyToken(req, res, token,{checkAdminExistence:true});
    if (verificationMessage != "success") {
      return;
    }
  }

  next();
};

const verifyToken = async (req, res, token,{checkAdminExistence}) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    // if token not valid or expired
    let errorMessage;
    if (err.name == "JsonWebTokenError") errorMessage = "Invalid token, Please login again...";
    if (err.name == "TokenExpiredError") errorMessage = "Login expired, Please login again...";
    delete req.session.token;
    req.session.errorMessage = errorMessage;
    return res.status(401).redirect('/');
  }

  // this line to not access database on every GET request
  if(!checkAdminExistence){
    const admin = await Admin.findById(decoded.adminId);

    // if admin deleted from database the token not valid
    if (!admin) {
      req.session.errorMessage = "This admin is no longer exists";
      delete req.session.token;
      return res.status(401).redirect('/');
    }
  }

  // if the user has permissions
  res.locals.isAdmin = true;

  return "success";
};