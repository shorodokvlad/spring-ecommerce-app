import React from "react";
import '../../style/footer.css';
import { NavLink } from "react-router-dom";

const Footer = () => {

    return (
        <footer className="footer">
            <div className="footer-links">
                <NavLink to={"/"}>About us</NavLink>
                <NavLink to={"/"}>Contact</NavLink>
                <NavLink to={"/"}>Terms & conditions</NavLink>
                <NavLink to={"/"}>Privacy policy</NavLink>
                <NavLink to={"/"}>FAQs</NavLink>
            </div>
            <div className="footer-info">
                <p>© 2026 SHV Store. All rights reserved.</p>
            </div>
        </footer>
    )
}
export default Footer;
