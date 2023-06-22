import express from 'express';
import { getBooks } from "../controllers/index.js";
import { checkAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get('/',checkAdmin, getBooks);


export default router;