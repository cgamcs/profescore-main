import React, { useEffect, useState } from 'react';
import { useQuery, useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query'; // Importar useInfiniteQuery
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import api from '../api';
import { ProfessorDetailLoader } from '../layouts/SkeletonLoader';
import ReportModal from '../components/ReportModal';
import { useToast } from '../hooks/use-toast';
import LikeButton from '@/components/LikeButton';

interface RatingType {
    _id: string;
    general: number;
    comment: string;
    subject: Subject;
    createdAt: string;
    likes: string[];
}

interface Subject {
    _id: string;
    name: string;
}

// Interfaz para la respuesta paginada
interface RatingsResponse {
    ratings: RatingType[];
    nextPage?: number;
    total: number;
}

const ProfessorDetail = () => {
    const { facultyId, professorId } = useParams();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [userId, setUserId] = useState<string>('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedComment, setSelectedComment] = useState<RatingType | null>(null);
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [, setError] = useState('');
    const [searchParams] = useSearchParams();
    const ratingSuccess = searchParams.get('ratingSuccess') === 'true';
    const addSuccess = searchParams.get('addSuccess') === 'true';

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    // Query del Profesor (Se mantiene igual, carga rápido porque es solo 1 documento)
    const { data: professor, isLoading: professorLoading } = useQuery({
        queryKey: ['professor', facultyId, professorId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors/${professorId}`).then(res => res.data),
        staleTime: 5 * 60 * 1000
    });

    // Query de Reseñas (CAMBIO A INFINITE QUERY)
    const {
        data: ratingsData,
        isLoading: ratingsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<RatingsResponse>({
        queryKey: ['ratings', facultyId, professorId],
        queryFn: ({ pageParam = 1 }) =>
            api.get(`/faculties/${facultyId}/professors/${professorId}/ratings`, {
                params: { page: pageParam, limit: 10 } // Pedimos de 10 en 10
            }).then(res => res.data),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1
    });

    // Aplanamos las páginas en un solo array de reseñas
    const ratings = ratingsData?.pages.flatMap(page => page.ratings) || [];

    const isLoading = professorLoading || ratingsLoading;

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            const newUserId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('userId', newUserId);
            setUserId(newUserId);
        } else {
            setUserId(storedUserId);
        }
    }, []);

    useEffect(() => {
        if (ratingSuccess || addSuccess) {
            // Invalidamos ambas queries para refrescar datos
            queryClient.invalidateQueries({ queryKey: ['professor', facultyId, professorId] });
            queryClient.invalidateQueries({ queryKey: ['ratings', facultyId, professorId] });

            toast({
                title: 'Éxito',
                description: addSuccess ? 'Profesor agregado correctamente' : 'Calificación enviada correctamente',
            });
        }
    }, [ratingSuccess, addSuccess, queryClient, facultyId, professorId, toast]);

    // Control de desplazamiento
    useEffect(() => {
        if (showReportModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [showReportModal]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={i} className="text-white dark:text-[#646464]" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-white dark:text-[#646464]" />}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <FaRegStar key={i + fullStars} className="text-white" />
                ))}
            </div>
        );
    };

    const renderCommentStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={i} className="text-indigo-500 dark:text-[#83838B]" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-indigo-500 dark:text-[#83838B]" />}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <FaRegStar key={i + fullStars} className="text-gray-300" />
                ))}
            </div>
        );
    };

    const handleLike = async (ratingId: string) => {
        // 1. Cancelar cualquier refetch en curso para que no sobrescriba nuestra actualización optimista
        await queryClient.cancelQueries({ queryKey: ['ratings', facultyId, professorId] });

        // 2. Guardar el estado anterior (Snapshot) por si hay error y tenemos que volver atrás
        const previousRatings = queryClient.getQueryData<InfiniteData<RatingsResponse>>(['ratings', facultyId, professorId]);

        // 3. ACTUALIZACIÓN OPTIMISTA: Modificamos la caché manualmente YA MISMO
        queryClient.setQueryData<InfiniteData<RatingsResponse>>(['ratings', facultyId, professorId], (oldData) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                pages: oldData.pages.map(page => ({
                    ...page,
                    ratings: page.ratings.map(rating => {
                        if (rating._id === ratingId) {
                            // Verificamos si ya tenía like del usuario
                            const isLiked = rating.likes.includes(userId);
                            return {
                                ...rating,
                                // Si ya tenía like, lo quitamos. Si no, lo agregamos.
                                likes: isLiked
                                    ? rating.likes.filter(id => id !== userId)
                                    : [...rating.likes, userId]
                            };
                        }
                        return rating;
                    })
                }))
            };
        });

        // 4. Enviar la petición al servidor (en segundo plano)
        try {
            await api.post(
                `/faculties/${facultyId}/professors/${professorId}/ratings/${ratingId}/vote`,
                { type: 1, userId: userId, captcha: captchaValue }
            );
            // No necesitamos invalidarQueries aquí, ya actualizamos la UI.
            // Solo limpiamos el captcha si se usó.
            setCaptchaValue('');
        } catch (error) {
            console.error('Error votando:', error);
            // 5. ROLLBACK: Si falla, restauramos la copia de seguridad
            queryClient.setQueryData(['ratings', facultyId, professorId], previousRatings);
            toast({
                title: 'Error',
                description: 'No se pudo registrar tu voto',
                variant: 'destructive'
            });
        }
    };

    // ... (El resto de funciones handleCaptchaChange, openReportModal, closeReportModal, handleReport, useEffects de titulo y ESC se quedan IGUAL) ...
    // Copia y pega esas funciones aquí, no cambian.
    const handleCaptchaChange = (value: string | null) => {
        if (value) { setCaptchaValue(value); setCaptchaError(''); } else { setCaptchaValue(''); }
    };

    const openReportModal = (comment: RatingType) => {
        setSelectedComment(comment);
        setShowReportModal(true);
        setIsClosing(false);
        setTimeout(() => { if (document.getElementById('report-form')) (document.getElementById('report-form') as HTMLFormElement).reset(); }, 100);
    };

    const closeReportModal = () => {
        setIsClosing(true);
        setTimeout(() => { setSelectedComment(null); setShowReportModal(false); setCaptchaValue(''); setCaptchaError(''); setIsClosing(false); }, 300);
    };

    const handleReport = async (event: React.FormEvent) => {
        event.preventDefault();
        const reason = (document.getElementById('report-reason') as HTMLSelectElement).value;
        const details = (document.getElementById('report-details') as HTMLTextAreaElement).value;
        if (!reason) { setError('Por favor selecciona un motivo de reporte'); return; }
        if (!captchaValue) { setCaptchaError('Por favor completa el CAPTCHA'); return; }
        try {
            const res = await api.post(
                `/faculties/${facultyId}/professors/${professorId}/ratings/${selectedComment?._id}/report`,
                { commentId: selectedComment?._id, reasons: [reason], reportComment: details || undefined, captcha: captchaValue }
            );
            if (res.status === 201) {
                toast({ title: 'Éxito', description: 'Reporte enviado exitosamente' });
                closeReportModal();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Error al enviar el reporte.', variant: 'destructive' });
        }
    };

    useEffect(() => {
        document.title = "ProfeScore - Maestros";
        const mainElement = document.getElementById('main-content');
        if (mainElement) { mainElement.style.viewTransitionName = 'main-content'; mainElement.style.contain = 'layout'; }
        return () => { const mainElement = document.getElementById('main-content'); if (mainElement) { mainElement.style.viewTransitionName = ''; mainElement.style.contain = ''; } };
    }, []);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && showReportModal) closeReportModal(); };
        if (showReportModal) document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [showReportModal]);

    if (isLoading) return <ProfessorDetailLoader />;
    if (!professor) return <div className='text-center text-red-500 py-4'>Profesor no encontrado</div>;

    return (
        <>
            <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        {/* ... (Toda la tarjeta de estadísticas del profesor se queda IGUAL) ... */}
                        <div className="bg-indigo-600 dark:bg-[#202024] text-white p-6 rounded-lg shadow-md mb-6">
                            <div className="text-3xl font-bold mb-2">
                                {professor.ratingStats.averageGeneral.toFixed(1)}
                            </div>
                            <div className="mb-3">
                                {renderStars(professor.ratingStats.averageGeneral)}
                            </div>
                            <div className="text-sm">
                                Basado en {professor.ratingStats.totalRatings} reseñas
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            {/* Barras de progreso */}
                            <div className="mb-1 dark:text-white font-medium">Explicación</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(professor.ratingStats.averageExplanation / 5) * 100}%` }}></div>
                            </div>
                            <div className="mb-1 dark:text-white font-medium">Accesible</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(professor.ratingStats.averageAccessibility / 5) * 100}%` }}></div>
                            </div>
                            <div className="mb-1 dark:text-white font-medium">Dificultad</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(professor.ratingStats.averageDifficulty / 5) * 100}%` }}></div>
                            </div>
                            <div className="mb-1 dark:text-white font-medium">Asistencia</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(professor.ratingStats.averageAttendance / 5) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6">
                            <h2 className="dark:text-white font-semibold text-lg mb-4">Información del Profesor</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
                                    <p className='dark:text-white'>{professor.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Materias</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {professor.subjects?.slice(0).map((subject: Subject) => (
                                            <li className='dark:text-white' key={subject._id}>
                                                {subject.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link to={`/facultad/${facultyId}/maestro/${professorId}/calificar`} className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                                Calificar Profesor
                            </Link>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h2 className="dark:text-white font-semibold text-lg mb-4">Reseñas de Estudiantes</h2>
                        <div className="space-y-4">
                            {/* Mapeo de reseñas aplanadas */}
                            {ratings.map((rating: RatingType) => (
                                <div key={rating._id} className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            {renderCommentStars(rating.general)}
                                            <p className="text-sm text-gray-500 dark:text-gray-300/70 mt-1">
                                                {rating.subject?.name || 'Materia no encontrada'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-white">
                                            {/* Usar toLocaleDateString asegura que se vea bien según el navegador del usuario */}
                                            {new Date(rating.createdAt).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-white mb-4">{rating.comment}</p>
                                    <div className={`flex items-center ${rating.likes.length > 0 ? 'gap-4' : 'gap-2'}`}>
                                        <LikeButton
                                            isLiked={rating.likes.includes(userId)}
                                            likeCount={rating.likes.length}
                                            onClick={() => handleLike(rating._id)}
                                        />

                                        <div className="border-l border-gray-200 dark:border-[#979797] pl-5">
                                            <div className="flex items-center gap-2">
                                                <a href="#" className="text-sm text-gray-500 dark:text-[#979797] hover:cursor-pointer" onClick={(e) => { e.preventDefault(); openReportModal(rating); }}>Reportar</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botón de Cargar Más */}
                        {hasNextPage && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="bg-white dark:bg-[#2B2B2D] border border-gray-300 dark:border-[#383939] text-gray-700 dark:text-white px-6 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-[#383939] transition-colors disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? 'Cargando...' : 'Cargar más reseñas'}
                                </button>
                            </div>
                        )}

                        {!isLoading && ratings.length === 0 && (
                            <p className="text-center text-gray-500 mt-10">Este profesor aún no tiene reseñas.</p>
                        )}
                    </div>
                </div>

                <ReportModal
                    showReportModal={showReportModal}
                    isClosing={isClosing}
                    selectedComment={selectedComment}
                    captchaValue={captchaValue}
                    captchaError={captchaError}
                    closeReportModal={closeReportModal}
                    handleReport={handleReport}
                    handleCaptchaChange={handleCaptchaChange}
                    SITE_KEY={SITE_KEY}
                />
            </main>
        </>
    );
};

export default ProfessorDetail;