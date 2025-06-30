import { LuLayoutDashboard, LuCircleDollarSign, LuWallet } from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";

const Sidebar = ({ currentView, onNavigate }) => {
    // Menu items configuration with actual component references
    const menuItems = [
        {
            view: 'dashboard',
            label: 'Dashboard',
            icon: <LuLayoutDashboard size={20} />
        },
        {
            view: 'commission',
            label: 'Commission',
            icon: <LuCircleDollarSign size={20} />
        },
        {
            view: 'report',
            label: 'Reports',
            icon: <TbReportAnalytics size={20} />
        },
        {
            view: 'payment',
            label: 'Payments',
            icon: <LuWallet size={20} />
        }
    ];

    const isActive = (view) => {
        return currentView === view;
    };

    return (
        <div className="w-64 bg-white h-screen p-4 border-r border-gray-200">
            {menuItems.map((item) => (
                <div className="mb-2" key={item.view}>
                    <button
                        onClick={() => onNavigate(item.view)}
                        className={`flex items-center w-full p-3 rounded-lg transition-colors ${isActive(item.view)
                            ? 'bg-red-50 text-red-600 border-l-4 border-red-500 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className={`mr-3 ${isActive(item.view) ? 'text-red-500' : ''}`}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Sidebar;