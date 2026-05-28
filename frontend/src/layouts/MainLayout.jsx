import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ title, children }) => (
  <div className="min-h-screen">
    <Sidebar />
    <div className="pl-64">
      <Navbar title={title} />
      <main className="p-8">{children}</main>
    </div>
  </div>
);

export default MainLayout;
