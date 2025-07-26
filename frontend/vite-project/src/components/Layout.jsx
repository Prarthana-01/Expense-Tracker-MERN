import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-50 p-4">{children}</main>
    </div>
  );
};

export default Layout;


