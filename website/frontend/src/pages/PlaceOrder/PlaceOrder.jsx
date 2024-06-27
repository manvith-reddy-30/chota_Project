import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { storecontext } from '../../context/storecontext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const PlaceOrder = () => {

  const {getTotalCartAmount,token,food_list,cartItems,url} = useContext(storecontext)

  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    city:"",
    state:"",
    street:"",
    zipcode:"",
    country:"",
    phone:""
  })

  const onChangeHanlder = (event) =>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const placeOrder = async (event) =>{
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0){
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id]
        orderItems.push(itemInfo)
      }
    })
    let orderData = {
      address:data,
      items:orderItems,
      amount:getTotalCartAmount()+2
    }

    let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}});
    console.log("here");
    if (response.data.success){
      const { session_url } = response.data;
      window.location.replace(session_url);
    }
    else{

      alert("Error");
    }
  }
  const navigate = useNavigate();
   useEffect(()=>{
       if(!token){
        navigate('/cart')
       }
       else if(getTotalCartAmount()==0){
        navigate('/cart')
       }
   },[token])
  
  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHanlder} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHanlder} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHanlder} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHanlder} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHanlder} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHanlder} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHanlder} value={data.zipcode} type="text" placeholder='Pin code' />
          <input required name='country' onChange={onChangeHanlder} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHanlder} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
      <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
          <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>


      </div>
      </form>
      )
}

      export default PlaceOrder