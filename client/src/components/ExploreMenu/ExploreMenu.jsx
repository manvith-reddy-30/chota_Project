// client/src/components/ExploreMenu/ExploreMenu.jsx (FINAL MODIFIED)

import React from 'react'
import './ExploreMenu.css'
// CORRECTED PATH: menu_list is imported from assets, which is one level up
import { menu_list } from '../../assets/assets' 

const ExploreMenu = ({category,setCategory}) => {
  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
      <div className='explore-menu-list'>
        {menu_list.map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key = {index} className='explore-menu-list-item'>
                {/* Ensure item.menu_image is a valid path/URL defined in assets.js */}
                <img className={category===item.menu_name?"active":""} src ={item.menu_image} alt={item.menu_name}/>
                <p>{item.menu_name}</p>
                </div>

            )
        })}
      </div>
      <div>
        <hr/>
      </div>
    </div>
  
  )
}

export default ExploreMenu;