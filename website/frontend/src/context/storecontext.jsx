import { createContext } from "react";
import { useState ,useEffect} from "react";
import { food_list } from "../assets/assets";


export const storecontext = createContext(null)
const StoreContextProvider = (props) =>{

    const [cartItems,setCartItems] = useState({});
    const addToCart =(itemId)=>{
        if(!cartItems[itemId]){
            setCartItems((prev)=>({...prev,[itemId]:1}))
        }
        else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
    }

    const removeFromCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))   
     }
    
    useEffect(()=>{console.log(cartItems);},[cartItems])
    
    
    
    const contextValue = {
     food_list,
     cartItems,
     setCartItems,
     addToCart,
     removeFromCart,

    }
    return (
        <storecontext.Provider value = {contextValue}>
        {props.children}
        </storecontext.Provider>
    )
}
export default StoreContextProvider