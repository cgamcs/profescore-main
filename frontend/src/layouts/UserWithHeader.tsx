import { Link, Outlet } from 'react-router-dom';
import Header from '../layouts/Header';

const LayoutWithHeader = () => {
  return (
    <div id="main-content" data-view-transition className="min-h-screen bg-white dark:bg-background scrollbar-none">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-background border-t border-gray-200 dark:border-[#202024]">
        <div className='container mx-auto text-sm text-center md:text-base md:text-left dark:text-white px-4 py-3 flex items-center justify-between'>
          <p>&copy; ProfeScore - {new Date().getFullYear()}</p>

          <div className="flex md:gap-4">
            <Link to="/faq" className="link">Preguntas Frecuentes</Link>
            <Link to="/privacy" className="link">Términos de Privacidad</Link>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LayoutWithHeader;