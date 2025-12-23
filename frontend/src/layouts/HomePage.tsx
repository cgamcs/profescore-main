import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import FacultyList from '../pages/FacultyList';
import TopRatedProfessors from './TopRatedProfessors';
import api from '../api';

const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'ProfeScore';
  }, []);

  // 1. HACEMOS LA PETICIÓN AQUÍ (UNA SOLA VEZ)
  const { data, isLoading, error } = useQuery({
    queryKey: ['homeData'],
    queryFn: async () => {
      const res = await api.get('/faculties');
      // Asumiendo que tu backend devuelve { faculties: [], topProfessors: [] }
      // Si devuelve estructura diferente, ajusta aquí.
      return res.data; 
    },
    staleTime: 5 * 60 * 1000 // 5 minutos de caché
  });

  const faculties = data?.faculties || [];
  const topProfessors = data?.topProfessors || [];

  return (
    <div id="main-content" data-view-transition className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Logo y título */}
      <div className="pt-10 pb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">ProfeScore</h1>
        <p className="text-gray-600 dark:text-[#d4d3d3] mt-2">Califica y encuentra a los mejores maestros</p>
      </div>

      {/* 2. PASAMOS LOS DATOS Y EL ESTADO DE CARGA A LOS HIJOS */}
      <FacultyList faculties={faculties} isLoading={isLoading} error={error} />
      <TopRatedProfessors professors={topProfessors} isLoading={isLoading} error={error} />

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024]">
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

export default HomePage;