import React  from 'react'
import './Header.css'
import { Typewriter } from 'react-simple-typewriter';

const Header = () => {

  const scrollToMenu = () => {
    const menuSection = document.getElementById('explore-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='header' id='home'>
        <div className='headercontents'>
            <h2>
            <Typewriter
              words={[
                'Craving Something Delicious?',
                'Add to Cart, Checkout, Done!',
                'Your Favorite Dishes Delivered Fast!',
              ]}
              loop={true} 
              cursor
              cursorStyle='_'
              typeSpeed={60}
              deleteSpeed={40}
              delaySpeed={1500}
            />
          </h2>

            <p>
          From cart to cravings — browse a variety of dishes, add to cart in a click, pay securely, and get your food delivered hot and fresh. All in minutes. Zero hassle, full flavor!
           </p>

            <button onClick={scrollToMenu}>View Menu</button>
        </div>
    </div>
  )
}

export default Header