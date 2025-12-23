import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopProfessorsLoader } from './SkeletonLoader';
import api from '../api';

interface Professor {
  _id: string;
  name: string;
  department?: {
    _id: string;
    name: string;
  };
  faculty: { _id: string; abbreviation: string };
  subjects: { _id: string; name: string }[];
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutos

const TopRatedProfessors: React.FC = () => {
  const { data: professors = [], isLoading, error } = useQuery({
    queryKey: ['topProfessors'],
    queryFn: () => api.get('/faculties').then(res => res.data.topProfessors),
    staleTime: STALE_TIME,
    select: (data) => data.map((prof: Professor) => ({
      _id: prof._id,
      name: prof.name,
      department: prof.department,
      faculty: prof.faculty,
      subjects: prof.subjects,
      ratingStats: {
        averageGeneral: prof.ratingStats.averageGeneral,
        totalRatings: prof.ratingStats.totalRatings
      }
    }))
  });

  // Memoizar el renderizado de estrellas
  const renderStars = useMemo(() => (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <i
            key={index}
            className={`fas fa-star ${
              index < Math.round(rating)
                ? 'text-indigo-500 dark:text-[#83838B]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }, []);

  if (isLoading) return <TopProfessorsLoader />;
  if (error) return <div className="text-center text-red-500 py-10">Error al cargar los profesores</div>;
  if (professors.length === 0) return <div className="text-center py-10">No hay profesores disponibles</div>;

  return (
    <section id="main-content" data-view-transition className="py-12 bg-gray-50 dark:bg-[#131313]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Maestros Mejor Calificados</h2>
          <p className="text-gray-600 dark:text-[#d4d3d3]">Descubre a los maestros con las mejores calificaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {professors.map((professor: Professor) => (
            <div key={professor._id} className="bg-white dark:bg-[#202024] rounded-lg shadow-sm border border-gray-200 dark:border-[#202024] p-6">
              <div className="flex items-center justify-between gap-1 mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{professor.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm">{professor.faculty.abbreviation}</p>
                </div>
                <div className="border border-gray-200 dark:border-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-lg">
                  {professor.ratingStats.averageGeneral.toFixed(1)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                {renderStars(professor.ratingStats.averageGeneral)}
                <span className="text-gray-500 dark:text-[#979797] text-sm">{professor.ratingStats.totalRatings} reseñas</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRatedProfessors;