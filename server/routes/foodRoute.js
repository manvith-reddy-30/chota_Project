import express  from "express"
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import { authMiddleware,checkRoleAdmin } from "../middleware/auth.js";
import multer from "multer";

const foodRouter = express.Router();

//Image storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})


foodRouter.post("/add", authMiddleware,checkRoleAdmin, upload.single("image"), addFood); 
foodRouter.get("/list",listFood) // Public: User frontend needs to list food
foodRouter.post("/remove", checkRoleAdmin, removeFood) // Apply checkRoleAdmin


export default foodRouter;