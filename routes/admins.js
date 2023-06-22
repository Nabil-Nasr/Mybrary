import express from 'express'
import { loginValidator } from "../utils/validators/admins.js"
import { getLoginForm, login, logout } from "../controllers/admins.js";

const router = express.Router();


router.route('/login')
  .get(getLoginForm)
  .post(loginValidator,login)

router.post('/logout',logout)

export default router;