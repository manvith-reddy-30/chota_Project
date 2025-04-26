import userModel from "../models/userModel.js";

const addToCart = async(req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added To Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

const removeFromCart = async(req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        } 
        if(cartData[req.body.itemId] <= 0){
            
            delete cartData[req.body.itemId];
            
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed From Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

const getCart = async(req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);

        // Check if userData is null
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData;

        // Check if cartData is null or undefined
        if (!cartData) {
            return res.json({ success: false, message: "No items in cart" });
        }

        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}


export {addToCart,removeFromCart,getCart}