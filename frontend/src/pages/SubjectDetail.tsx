import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { SubjectDetailLoader } from '../layouts/SkeletonLoader';
import api from '../api';

interface IProfessor {
  _id: string;
  name: string;
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const SubjectDetail = () => {
  const { facultyId, subjectId } = useParams();
  
  // Estados para UX (Búsqueda y Ordenamiento local)
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating'); // Default: Mejor calificados primero

  const { data: subjectData, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', facultyId, subjectId],
    queryFn: () => api.get(`/faculties/${facultyId}/subjects/${subjectId}`).then(res => res.data),
  });

  const { data: professorsData = [], isLoading: professorsLoading } = useQuery({
    queryKey: ['subjectProfessors', facultyId, subjectId],
    queryFn: () => api.get(`/faculties/${facultyId}/subjects/${subjectId}/professors`).then(res => res.data),
  });

  const isLoading = subjectLoading || professorsLoading;

  // Lógica de Filtrado y Ordenamiento (Se ejecuta en el navegador, costo 0 para el servidor)
  const processedProfessors = useMemo(() => {
    if (!professorsData) return [];

    let result = [...professorsData];

    // 1. Filtrar por búsqueda
    if (localSearch) {
        const query = localSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        result = result.filter(p => 
            p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)
        );
    }

    // 2. Ordenar
    result.sort((a, b) => {
        if (sortBy === 'rating') {
            // Mayor calificación primero
            return b.ratingStats.averageGeneral - a.ratingStats.averageGeneral;
        } else {
            // Alfabético
            return a.name.localeCompare(b.name);
        }
    });

    return result;
  }, [professorsData, localSearch, sortBy]);

  useEffect(() => {
    document.title = subjectData ? `ProfeScore - ${subjectData.name}` : "ProfeScore - Materia";
    
    const mainElement = document.getElementById('main-content');
    if (mainElement) {
      mainElement.style.viewTransitionName = 'main-content';
      mainElement.style.contain = 'layout';
    }

    return () => {
      const mainElement = document.getElementById('main-content');
      if (mainElement) {
        mainElement.style.viewTransitionName = '';
        mainElement.style.contain = '';
      }
    };
  }, [subjectData]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <i key={index} className="fas fa-star text-indigo-500 dark:text-[#83838B] text-sm" />;
          }
          if (index === fullStars && hasHalfStar) {
            return <i key={index} className="fas fa-star-half-alt text-indigo-500 dark:text-[#83838B] text-sm" />;
          }
          return <i key={index} className="far fa-star text-gray-300 text-sm" />;
        })}
      </div>
    );
  };

  if (isLoading) return <SubjectDetailLoader />;
  if (!subjectData) return <div className="text-center py-4 dark:text-white">No se encontró la materia</div>;

  return (
    <>
      <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl dark:text-white font-bold">{subjectData.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
             {subjectData.department?.name || 'Departamento General'}
          </p>
        </div>

        {/* Subject Info Card */}
        <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-[#979797] uppercase">Créditos</h3>
              <p className="dark:text-white font-semibold text-lg">{subjectData.credits}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-[#979797] uppercase">Profesores</h3>
              <p className="dark:text-white font-semibold text-lg">{professorsData.length}</p>
            </div>
             {/* Espacio para más métricas futuras (ej. % de aprobados) */}
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-[#979797] uppercase mb-1">Descripción</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {subjectData.description || 'Sin descripción disponible para esta materia.'}
            </p>
          </div>
        </div>

        {/* Controls: Search & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl dark:text-white font-semibold w-full md:w-auto">
                Profesores disponibles
            </h2>
            
            <div className="flex gap-2 w-full md:w-auto">
                {/* Buscador local */}
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar profesor..." 
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#383939] dark:bg-[#2B2B2D] dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Ordenamiento */}
                <div className='flex px-3 py-1 border border-gray-200 dark:border-[#383939] dark:bg-[#2B2B2D] dark:text-white rounded-lg'>
                  <select 
                    className="text-sm pr-2 outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                  >
                      <option value="rating">Calificación</option>
                      <option value="name">Nombre</option>
                  </select>
                </div>
            </div>
        </div>

        {/* Teachers List */}
        <div className="space-y-3">
          {processedProfessors.map((professor: IProfessor) => (
            <Link
              key={professor._id}
              to={`/facultad/${facultyId}/maestro/${professor._id}`}
              className="block bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                
                {/* Nombre y Dept */}
                <div>
                    <h3 className="font-medium text-lg text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700">
                        {professor.name}
                    </h3>
                     {/* Si el backend devolviera el departamento del profe, iría aquí */}
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-gray-500 dark:text-[#979797] text-xs">
                        {professor.ratingStats.totalRatings} reseñas
                    </span>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#2B2B2D] px-3 py-1.5 rounded-full border border-gray-100 dark:border-[#383939]">
                        <span className={`font-bold text-sm ${
                            professor.ratingStats.averageGeneral >= 4 ? 'text-green-600 dark:text-green-400' : 
                            professor.ratingStats.averageGeneral >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                        }`}>
                        {professor.ratingStats.averageGeneral.toFixed(1)}
                        </span>
                        {renderStars(professor.ratingStats.averageGeneral)}
                    </div>
                </div>
              </div>
            </Link>
          ))}
          
          {processedProfessors.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-[#979797]">
                <p>No se encontraron profesores con esos criterios.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SubjectDetail;