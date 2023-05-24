import express from 'express';
import { getBooks } from "../controllers/index.js";

const router = express.Router();

router.get('/', getBooks);


export default router;