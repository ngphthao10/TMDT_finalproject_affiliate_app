import { FaRegBell, FaRegUser } from "react-icons/fa";
// import { LuSquareArrowRight } from "react-icons/lu";

const Navbar = ({ user, onLogout, currentView, onNavigate }) => {
    // Generate breadcrumb items based on current view
    const getBreadcrumbs = () => {
        if (!currentView || currentView === 'dashboard') {
            return [{ name: 'Dashboard', view: 'dashboard' }];
        }

        const formattedName = currentView.charAt(0).toUpperCase() + currentView.slice(1);
        return [
            { name: 'Dashboard', view: 'dashboard' },
            { name: formattedName, view: currentView }
        ];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-md">
            {/* Left section with logo and dynamic breadcrumbs */}
            <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center rounded-md mr-3">
                    <span className="font-bold">K</span>
                </div>
                <div className="flex items-center text-gray-700">
                    {breadcrumbs.map((breadcrumb, index) => (
                        <div key={breadcrumb.view} className="flex items-center">
                            {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                            <button
                                onClick={() => onNavigate(breadcrumb.view)}
                                className={`hover:text-red-500 transition-colors ${index === breadcrumbs.length - 1 ? 'font-medium' : ''
                                    }`}
                            >
                                {breadcrumb.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right section with user info */}
            <div className="flex items-center space-x-4">
                {/* User profile */}
                {user && (
                    <div className="flex items-center">
                        <div className="text-right mr-3">
                            <p className="text-sm font-medium text-gray-700">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <span className="text-xl"><FaRegUser /></span>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <span className="text-xl"><FaRegBell /></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        2
                    </span>
                </div>

                {/* More options */}
                <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <span className="text-xl">⋯</span>
                </div>

                {/* Logout button */}
                <button
                    onClick={onLogout}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;