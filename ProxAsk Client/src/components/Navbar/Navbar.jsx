import React, { useEffect, useRef, useState } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { dummyProfiles } from "../../utils/dummyProfiles";

import "./Navbar.css";

//dummy data
const users = [
    { username: "princeraj", name: "Prince Raj" },
    { username: "aman", name: "Aman Verma" },
    { username: "john", name: "John Doe" },
];


const Navbar = ({ onMenuClick }) => {
    const [searchType, setSearchType] = useState("all");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);


    const notificationRef = useRef(null);
    const profileRef = useRef(null);


    // using dummy data
    const users = dummyProfiles.map((p) => ({
        username: p.username,
        name: p.name,
    }));

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }

            if (
                profileRef.current &&
                !profileRef.current.contains(e.target)
            ) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="navbarRoot">
            <button className="menuButton" onClick={onMenuClick}>
                ☰
            </button>

            {/* Search */}
            <div className="navbarSearch">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="questions">Questions</option>
                    <option value="users">Users</option>
                </select>
                <input
                    placeholder="Search Proxask..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setShowResults(true);
                    }}
                />
                {showResults && searchText && (
                    <div className="searchResults">
                        {users
                            .filter((u) =>
                                u.username.toLowerCase().includes(searchText.toLowerCase())
                            )
                            .map((u) => (
                                <div
                                    key={u.username}
                                    className="searchResultItem"
                                    onClick={() => {
                                        navigate(`/profile/${u.username}`);
                                        setShowResults(false);
                                        setSearchText("");
                                    }}
                                >
                                    <strong>{u.name}</strong>
                                    <span>@{u.username}</span>
                                </div>
                            ))}
                    </div>
                )}

            </div>

            {/* Actions */}
            <div className="navbarActions">
                {/* Notifications */}
                <div className="navbarDropdownWrapper" ref={notificationRef}>
                    <FaBell
                        className="navbarIcon"
                        onClick={() => setShowNotifications((prev) => !prev)}
                    />

                    {showNotifications && (
                        <div className="dropdownMenu">
                            <p className="dropdownTitle">Notifications</p>

                            <div className="dropdownItem">
                                Someone answered your question
                            </div>
                            <div className="dropdownItem">
                                New follower joined you
                            </div>
                            <div className="dropdownItem">
                                You received a message
                            </div>

                            <div className="dropdownFooter">View all</div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="navbarDropdownWrapper" ref={profileRef}>
                    <FaUserCircle
                        className="navbarIcon"
                        onClick={() => setShowProfile((prev) => !prev)}
                    />

                    {showProfile && (
                        <div className="dropdownMenu">
                            <div className="dropdownItem">Profile</div>
                            <div className="dropdownItem">Settings</div>
                            <div className="dropdownItem logout">Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
