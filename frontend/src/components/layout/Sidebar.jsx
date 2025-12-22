import { NavLink } from 'react-router-dom';

const Sidebar = ({ items, title }) => {
  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen fixed right-0 top-16">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
