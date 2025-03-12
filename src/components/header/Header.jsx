import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../header/Header.module.css';

const Header = () => {
    return (
        <div className={styles["left-bar"]}>
            <ul>
                <li><Link to="/">HOME</Link></li>
                <li><Link to="/sell">SELL</Link></li> 
                <li><Link to="/about">STOCK</Link></li>
            </ul>
        </div>
    );
}

export default Header;
