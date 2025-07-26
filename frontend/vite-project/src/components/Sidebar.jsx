import { NavLink } from "react-router-dom";
import girl from "../assets/girl.png";

const Sidebar = () => {
  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Income", path: "/income" },
    { label: "Expense", path: "/expense" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 min-h-screen bg-white shadow-md p-4 flex flex-col items-center">
      <img src={girl} alt="avatar" className="w-24 h-24 rounded-full mb-6" />
      <nav className="w-full space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block w-full px-4 py-2 text-lg font-medium rounded text-center ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-800 hover:bg-blue-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 text-lg font-medium text-center text-red-600 hover:bg-red-100 rounded"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
