import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faX } from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo/logo.png";
import profilePic from "../../logo/account.jpg"; // Static profile picture

const Header = () => {
  const [icon, setIcon] = useState(faBars);
  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken); // Check if the user is logged in
  }, []);

  const toggleNav = () => {
    setIcon((prevIcon) => (prevIcon === faBars ? faX : faBars));
    setNavOpen((prevNavOpen) => !prevNavOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    
    setIsLoggedIn(false); // Update login state
    navigate("/login"); // Redirect to login
  };

  return (
    <header className="bg-[#041014]">
      <nav className="flex justify-between items-center w-[92%] mx-auto py-2">
        {/* Logo */}
        <div>
          <Link to="/">
            <img src={logo} alt="logo" className="w-[20vh]" />
          </Link>
        </div>

        {/* Navigation Links */}
        <div>
          <div
            className={`lg:static absolute lg:w-auto w-full lg:min-h-fit min-h-[60vh] left-0 ${
              navOpen ? "top-[10%]" : "top-[-100%]"
            }`}
          >
            <ul className="flex lg:flex-row flex-col items-center lg:gap-[4.5vw] gap-10 text-[1.3rem]">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block py-1 pr-4 pl-3 duration-200 ${
                      isActive ? "text-[#00a8e8]" : "text-[#ffffff]"
                    } hover:text-[#007ea7]`
                  }
                >
                  HOME
                </NavLink>
              </li>
              {!isLoggedIn && (
                <>
                  <li>
                    <NavLink
                      to="/signup"
                      className={({ isActive }) =>
                        `block py-2 pr-4 pl-3 duration-200 ${
                          isActive ? "text-[#00a8e8]" : "text-[#ffffff]"
                        } hover:text-[#007ea7]`
                      }
                    >
                      SIGN UP
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `block py-2 pr-4 pl-3 duration-200 ${
                          isActive ? "text-[#00a8e8]" : "text-[#ffffff]"
                        } hover:text-[#007ea7]`
                      }
                    >
                      LOGIN
                    </NavLink>
                  </li>
                </>
              )}
              {isLoggedIn && (
                <li className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-white hover:border-gray-300"
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute bg-white text-black rounded-md mt-2 shadow-lg right-0 z-10">
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </div>

          {/* Hamburger Icon for Mobile */}
          <div onClick={toggleNav}>
            <FontAwesomeIcon
              icon={icon}
              style={{ cursor: "pointer", color: "#ffffff" }}
              className="lg:hidden h-6 flex items-center justify-center pt-1"
            />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;