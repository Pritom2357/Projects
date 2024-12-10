import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const options = [
        {path: "/", label: "API Data"},
        // {path: "/mintegral-table", label: "Mintegral Table"},
        {path: "/mintegral-date-spend", label: "Spend Overview"},
        // {path: "/date-country-spend", label: "Date Country Spend"}
        {path: "/game-country-spend", label: "Game wise Country Spend"}
    ];

    const currentPath = location.pathname;
    const currentOptions = options.find(option => option.path === currentPath) || options[0];

    const handleChange = (event)=>{
        const selectedPath = event.target.value;
        navigate(selectedPath);
    };

    return(
        <div className="w-full p-4 bg-gray-100 flex justify-center">
            <select
            value={currentPath} 
            onChange={handleChange} 
            className="border p-2 rounded w-full text-center"
            >
            {
                options.map((option)=> (
                    <option key={option.path} value={option.path}>
                        {option.label}
                    </option>
                ))
            }
            </select>
        </div>
    )
}

export default Navbar;