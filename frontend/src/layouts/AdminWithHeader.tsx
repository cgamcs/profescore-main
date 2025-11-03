import { Link, Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminWithHeader = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] scrollbar">
      <AdminHeader />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024]">
        <div className='container mx-auto px-4 py-3 dark:text-white flex items-center justify-between'>
          <p>&copy; ProfeScore - {new Date().getFullYear()}</p>

          <div className="flex gap-4 dark:text-white">
            <Link to="/faq" className="link">Preguntas Frecuentes</Link>
            <Link to="/privacy" className="link">Términos de Privacidad</Link>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default AdminWithHeader;