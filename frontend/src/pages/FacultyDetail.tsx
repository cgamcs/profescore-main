import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FacultyDetailLoader } from '../layouts/SkeletonLoader';
import api from '../api';
import useViewTransition from '../layouts/useViewTransition';

interface ISubject {
    _id: string;
    name: string;
    credits: number;
    department: {
        _id: string;
        name: string;
    };
    professors: string[];
}

interface IProfessor {
    _id: string;
    name: string;
    subjects: string[];
    department: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

const FacultyDetails = () => {
    const { facultyId } = useParams();
    const { handleLinkClick } = useViewTransition();
    
    // Estados para la búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const subjectsContainerRef = useRef<HTMLTableElement>(null);
    const professorsContainerRef = useRef<HTMLDivElement>(null);
    const [subjectsHeight, setSubjectsHeight] = useState<number | null>(null);
    const [professorsHeight, setProfessorsHeight] = useState<number | null>(null);

    // 1. EFECTO DEBOUNCE: Espera 500ms después de que dejas de escribir para actualizar
    // esto evita hacer peticiones por cada letra que escribes.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 2. QUERY OPTIMIZADO PARA MATERIAS (DASHBOARD)
    const { data: subjects = [], isLoading: subjectsLoading } = useQuery<ISubject[]>({
        // AGREGAMOS 'dashboard' AQUÍ
        queryKey: ['subjects', facultyId, 'dashboard', debouncedSearch], 
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`, {
            params: {
                search: debouncedSearch,
                limit: debouncedSearch ? 20 : 6 
            }
        }).then(res => res.data),
        placeholderData: keepPreviousData 
    });

    // 3. QUERY OPTIMIZADO PARA PROFESORES (DASHBOARD)
    const { data: professors = [], isLoading: professorsLoading } = useQuery<IProfessor[]>({
        // AGREGAMOS 'dashboard' AQUÍ
        queryKey: ['professors', facultyId, 'dashboard', debouncedSearch],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`, {
            params: {
                search: debouncedSearch,
                limit: debouncedSearch ? 20 : 3
            }
        }).then(res => res.data),
        placeholderData: keepPreviousData
    });

    useEffect(() => {
        document.title = "ProfeScore - Facultad";
        const prepareTransition = () => {
          const root = document.documentElement;
          root.style.viewTransitionName = 'root';
          root.style.animation = 'none';
          const mainElement = document.getElementById('main-content');
          if (mainElement) {
            mainElement.style.viewTransitionName = 'main-content';
            mainElement.style.contain = 'layout';
          }
        };
        prepareTransition();
        return () => {
          const root = document.documentElement;
          root.style.viewTransitionName = '';
          const mainElement = document.getElementById('main-content');
          if (mainElement) {
            mainElement.style.viewTransitionName = '';
            mainElement.style.contain = '';
          }
        };
    }, []);

    // Alturas dinámicas
    useEffect(() => {
        if (!subjectsLoading && !professorsLoading) {
            if (subjectsContainerRef.current) setSubjectsHeight(subjectsContainerRef.current.offsetHeight);
            if (professorsContainerRef.current) setProfessorsHeight(professorsContainerRef.current.offsetHeight);
        }
    }, [subjectsLoading, professorsLoading, subjects, professors]);

    // Renderizado de Estrellas
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => {
                    if (index < fullStars) return <i key={index} className="fas fa-star text-indigo-500 dark:text-[#83838B] text-sm" />;
                    if (index === fullStars && hasHalfStar) return <i key={index} className="fas fa-star-half-alt text-indigo-500 dark:text-[#83838B] text-sm" />;
                    return <i key={index} className="far fa-star text-gray-300 text-sm" />;
                })}
            </div>
        );
    };

    // Determinar si estamos en modo búsqueda (ya no filtramos array localmente)
    const isSearching = searchQuery.trim() !== '';

    return (
        <main id="root-main" data-view-transition className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-black dark:text-white text-center mb-6">Tu Guía Académica</h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre del maestro o materia..."
                    className="w-full border dark:text-white border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-[#383939] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Lógica de Renderizado condicional para Búsqueda Combinada */}
            {/* Si NO buscamos, mostramos ambas tablas. Si buscamos, mostramos lo que haya encontrado la API */}
            
            {/* Sección de Materias (Se oculta si buscas un profesor y la API devuelve 0 materias, lógica opcional) */}
            {(!isSearching || subjects.length > 0) && (
                <section className="mb-12">
                    <h2 className="dark:text-white text-xl font-semibold mb-4">
                        {isSearching ? `Materias encontradas` : 'Tabla de Materias'}
                    </h2>
                    {subjectsLoading ? <FacultyDetailLoader /> : (
                         <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm transition-all"
                              style={{ minHeight: subjectsHeight ? `${subjectsHeight}px` : 'auto' }}>
                            <table ref={subjectsContainerRef} className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                                <thead className="bg-gray-50 dark:bg-indigo-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Créditos</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                                    {subjects.map((subject: ISubject) => (
                                        <tr key={subject._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-white">
                                                <a href={`/facultad/${facultyId}/materia/${subject._id}`}
                                                   onClick={(e) => handleLinkClick(`/facultad/${facultyId}/materia/${subject._id}`, e)}>
                                                    {subject.name}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{subject.credits}</td>
                                        </tr>
                                    ))}
                                    {subjects.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No se encontraron materias</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {/* Sección de Profesores */}
            {(!isSearching || professors.length > 0) && (
                <section>
                    <h2 className="text-xl dark:text-white font-semibold mb-4">
                        {isSearching ? `Profesores encontrados` : 'Maestros Mejor Calificados'}
                    </h2>
                    {professorsLoading ? <FacultyDetailLoader /> : (
                        <div ref={professorsContainerRef} 
                             className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all"
                             style={{ minHeight: professorsHeight ? `${professorsHeight}px` : 'auto' }}>
                            {professors.map((professor: IProfessor) => (
                                <a key={professor._id}
                                   href={`/facultad/${facultyId}/maestro/${professor._id}`}
                                   onClick={(e) => handleLinkClick(`/facultad/${facultyId}/maestro/${professor._id}`, e)}
                                   className="block">
                                    <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
                                        <h3 className="font-medium dark:text-white text-lg mb-1">{professor.name}</h3>
                                        <div className="flex items-center">
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
                                </a>
                            ))}
                            {professors.length === 0 && <p className="text-gray-500">No se encontraron profesores.</p>}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
};

export default FacultyDetails;