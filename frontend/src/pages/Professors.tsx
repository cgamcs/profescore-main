import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ProfessorPageLoader } from '../layouts/SkeletonLoader';
import api from '../api';
import useViewTransition from '../layouts/useViewTransition';

// Interfaz para las materias que vienen dentro del profesor (populadas)
interface ISubjectPopulated {
    _id: string;
    name: string;
}

interface IProfessor {
    _id: string;
    name: string;
    department?: string;
    subjects: ISubjectPopulated[]; 
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

const ProfessorsPage = () => {
    const { facultyId } = useParams<{ facultyId: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const { handleLinkClick } = useViewTransition();

    // 1. DEBOUNCE EFFECT
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 2. QUERY PROFESORES
    // Solo traemos los datos necesarios para visualizar
    const { data: professors = [], isLoading: professorsLoading } = useQuery<IProfessor[]>({
        queryKey: ['professors', facultyId, debouncedSearch],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`, {
            params: {
                search: debouncedSearch,
                limit: debouncedSearch ? 20 : 50
            }
        }).then(res => res.data),
        placeholderData: keepPreviousData
    });

    // NOTA: Eliminamos useQuery de 'allSubjects' porque el usuario ya no necesita 
    // el catálogo completo para editar o crear. Ahorro total de recursos.

    useEffect(() => {
        document.title = "ProfeScore - Maestros";
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
    }, []);

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

    if (professorsLoading) return <ProfessorPageLoader />;

    return (
        <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl dark:text-white font-bold">Maestros</h1>
                {/* Eliminado el botón de "Agregar Maestro" */}
            </div>

            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar profesor..."
                    className="w-full border dark:text-white border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-[#383939] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                        <thead className="bg-gray-50 dark:bg-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materias</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Calificación</th>
                                {/* Eliminada columna de Acciones */}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                            {professors.map((professor: IProfessor) => (
                                <tr key={professor._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/facultad/${facultyId}/maestro/${professor._id}`}
                                            onClick={(e) => handleLinkClick(`/facultad/${facultyId}/maestro/${professor._id}`, e)}
                                            className="text-indigo-600 dark:text-white font-medium"
                                        >
                                            {professor.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {professor.subjects?.slice(0, 2).map((subject) => (
                                                <span
                                                    key={subject._id}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-white"
                                                >
                                                    {subject.name}
                                                </span>
                                            ))}
                                            {professor.subjects?.length > 2 && (
                                                <span className="text-xs text-gray-400 self-center">
                                                    +{professor.subjects.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="bg-indigo-100 dark:bg-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                                {professor.ratingStats.averageGeneral.toFixed(1)}
                                            </span>
                                            {renderStars(professor.ratingStats.averageGeneral)}
                                        </div>
                                    </td>
                                    {/* Eliminada celda de botón editar */}
                                </tr>
                            ))}
                            
                            {professors.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-[#979797]">
                                        No se encontraron profesores para "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Eliminado el componente Dialog */}
        </main>
    );
};

export default ProfessorsPage;