import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
const Navbar = () => {
    return (
        <div className='navbar'>
           
                 <div className="logo">
                         
                         <img src={assets.logo} alt="Logo" className="logopng" />
                      
                       <h1 className="logoname">CUISINECRAZE</h1>
                 
                       </div>
            <img className='profile' src={assets.profile_image} alt="" />
        </div>
    )
}
export default Navbar

            
            
