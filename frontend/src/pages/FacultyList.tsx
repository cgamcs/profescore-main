import React from 'react';
import { Link } from 'react-router-dom';
import { FacultyListLoader } from '../layouts/SkeletonLoader';
import useViewTransition from '../layouts/useViewTransition';

// Definimos la interfaz de lo que esperamos recibir
interface Faculty {
  _id: string;
  name: string;
  abbreviation: string;
}

interface FacultyListProps {
  faculties: Faculty[];
  isLoading: boolean;
  error: unknown;
}

const FacultyList: React.FC<FacultyListProps> = ({ faculties, isLoading, error }) => {
  const { handleLinkClick } = useViewTransition();

  if (isLoading) return <FacultyListLoader />;
  if (error) return <div className="text-center text-red-500 py-10">Error al cargar las facultades</div>;

  return (
    <section id="main-content" data-view-transition className="pb-12 bg-white dark:bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lista de Facultades</h2>
          <p className="text-gray-600 dark:text-[#d4d3d3]">Selecciona tu facultad</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {Array.isArray(faculties) && faculties.slice(0, 12).map((faculty) => (
            <Link
              key={faculty._id}
              to={`/facultad/${faculty._id}`}
              onClick={(e) => handleLinkClick(`/facultad/${faculty._id}`, e)}
              className="bg-white dark:bg-[#202024] border border-gray-200 dark:border-[#202024] rounded-lg p-4 text-center hover:bg-indigo-600 hover:text-white dark:hover:border-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <h3 className="dark:text-white font-bold text-lg mb-1">{faculty.abbreviation}</h3>
              <p className="dark:text-white text-xs opacity-80 line-clamp-2">{faculty.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultyList;