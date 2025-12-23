import { useState, useEffect, useCallback } from 'react'; // Eliminado useMemo innecesario
import axios from 'axios';
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, MoreHorizontal, Star, Trash2, Edit, ChevronLeft, ChevronRight, Eye, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import SubjectSelector from '../../components/ui/subjectselector';

const API_URL = import.meta.env.VITE_API_URL;

// Interfaces actualizadas para coincidir con la respuesta paginada
interface IFaculty {
    _id: string;
    name: string;
    abbreviation?: string;
}

interface IProfessor {
    _id: string;
    name: string;
    faculty: string;
    facultyAbbreviation?: string;
    facultyId: string;
    subjects: string[]; // Nombres de materias para visualización
    subjectIds?: string[]; // IDs para edición
    ratingStats: {
        averageGeneral: number;
        averageExplanation: number;
        averageAccessibility: number;
        averageDifficulty: number;
        averageAttendance: number;
        totalRatings: number;
    };
}

interface ISubject {
    _id: string;
    name: string;
    facultyId: string;
}

const Professors = () => {
    const { toast } = useToast();
    
    // Estados de Datos
    const [professors, setProfessors] = useState<IProfessor[]>([]);
    const [faculties, setFaculties] = useState<IFaculty[]>([]);
    const [modalSubjects, setModalSubjects] = useState<ISubject[]>([]); // Materias SOLO para el modal
    
    // Estados de Paginación y Búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Estados de Modales
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    
    // Estados de Acción
    const [professorToDelete, setProfessorToDelete] = useState<IProfessor | null>(null);
    const [currentProfessor, setCurrentProfessor] = useState<any>(null); // Tipado flexible para el form
    const [viewingProfessor, setViewingProfessor] = useState<IProfessor | null>(null);
    const [confirmName, setConfirmName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    // 1. DEBOUNCE EFFECT: Evita peticiones excesivas al escribir
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Resetear a página 1 al buscar
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. CARGA DE PROFESORES (Server-Side Pagination)
    const fetchProfessors = useCallback(async () => {
        try {
            setIsLoadingData(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(`${API_URL}/admin/professors`, {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: debouncedSearch
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfessors(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Error cargando profesores', variant: 'destructive' });
        } finally {
            setIsLoadingData(false);
        }
    }, [currentPage, debouncedSearch, toast]);

    useEffect(() => {
        fetchProfessors();
    }, [fetchProfessors]);

    // 3. CARGA INICIAL DE FACULTADES (Solo una vez)
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/faculty`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setFaculties(res.data);
            } catch (error) {
                console.error("Error loading faculties");
            }
        };
        fetchFaculties();
    }, []);

    // 4. CARGA DE MATERIAS BAJO DEMANDA (Lazy Loading)
    // Solo se llama cuando cambia la facultad seleccionada en el modal
    const fetchSubjectsForFaculty = async (facultyId: string) => {
        if (!facultyId) {
            setModalSubjects([]);
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/admin/faculty/${facultyId}/subjects`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Mapeamos para asegurar que tengan facultyId
            const mappedSubjects = res.data.map((s: any) => ({ ...s, facultyId }));
            setModalSubjects(mappedSubjects);
        } catch (error) {
            console.error("Error loading subjects for faculty");
            setModalSubjects([]);
        }
    };

    // --- HANDLERS ---

    const handleOpenAddDialog = () => {
        setCurrentProfessor({
            _id: '',
            name: '',
            facultyId: '',
            subjects: [] // IDs
        });
        setModalSubjects([]); // Limpiar materias
        setErrors({});
        setOpenDialog(true);
    };

    const handleEditProfessor = async (professor: IProfessor) => {
        // Al editar, primero cargamos las materias de ESA facultad
        await fetchSubjectsForFaculty(professor.facultyId);
        
        // Necesitamos mapear los nombres de materias a sus IDs
        // Como el endpoint principal devuelve nombres (por eficiencia), 
        // aquí hacemos un "best effort" buscando en las materias que acabamos de cargar.
        // NOTA: Para producción ideal, el endpoint de "Get Professor By ID" debería usarse aquí 
        // para obtener los IDs reales, pero esto funcionará si los nombres coinciden.
        
        // Opción robusta: Traer detalles completos del profesor
        try {
            const detailRes = await axios.get(`${API_URL}/admin/faculty/${professor.facultyId}/professor/${professor._id}`, {
                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            const fullProfData = detailRes.data;
            
            setCurrentProfessor({
                _id: fullProfData._id,
                name: fullProfData.name,
                facultyId: fullProfData.faculty, // Asumiendo que devuelve el ID
                subjects: fullProfData.subjects.map((s: any) => s._id || s) // IDs
            });
            setOpenDialog(true);
        } catch (err) {
            toast({ title: "Error", description: "No se pudo cargar detalles para editar", variant: "destructive" });
        }
    };

    const handleFacultyChange = async (value: string) => {
        // Actualizar estado del form
        setCurrentProfessor((prev: any) => ({
            ...prev,
            facultyId: value,
            subjects: [] // Resetear materias al cambiar facultad
        }));
        // Cargar nuevas materias
        await fetchSubjectsForFaculty(value);
    };

    const handleSaveProfessor = async () => {
        if (!currentProfessor) return;

        const newErrors: { [key: string]: string } = {};
        if (!currentProfessor.name.trim()) newErrors.name = 'Nombre requerido';
        if (!currentProfessor.facultyId) newErrors.faculty = 'Facultad requerida';
        if (currentProfessor.subjects.length === 0) newErrors.subjects = 'Selecciona al menos una materia';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoadingAction(true);

            const payload = {
                name: currentProfessor.name,
                facultyId: currentProfessor.facultyId,
                subjects: currentProfessor.subjects // IDs
            };

            const endpoint = currentProfessor._id ?
                `${API_URL}/admin/faculty/${currentProfessor.facultyId}/professor/${currentProfessor._id}` :
                `${API_URL}/admin/faculty/${currentProfessor.facultyId}/professor/multiple`;

            await axios[currentProfessor._id ? 'put' : 'post'](endpoint, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            toast({
                title: 'Éxito',
                description: `Profesor ${currentProfessor._id ? 'actualizado' : 'creado'} correctamente`
            });

            setOpenDialog(false);
            fetchProfessors(); // Recargar tabla
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error al guardar profesor',
                variant: 'destructive'
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const getInitials = (name: string) => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "text-green-500";
        if (rating >= 4.0) return "text-emerald-500";
        if (rating >= 3.5) return "text-amber-500";
        if (rating >= 3.0) return "text-orange-500";
        return "text-red-500";
    };

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl dark:text-white font-bold">Profesores</h1>
                    <Button
                        className="bg-black dark:bg-indigo-600 text-white hover:cursor-pointer"
                        onClick={handleOpenAddDialog}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Profesor
                    </Button>
                </div>

                <div className="relative w-full max-w-md mb-6">
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full border border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-gray-300 dark:border-[#383939] rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profesor</TableHead>
                                <TableHead>Facultad</TableHead>
                                <TableHead>Materias</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingData ? (
                                // Skeleton simplificado
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5} className="h-16 text-center animate-pulse">Cargando...</TableCell></TableRow>
                                ))
                            ) : professors.length > 0 ? (
                                professors.map((professor) => (
                                    <TableRow key={professor._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span className="font-medium">{professor.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{professor.facultyAbbreviation || 'N/A'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {professor.subjects.slice(0, 3).map((subject, index) => (
                                                    <Badge key={index} variant="outline">{subject}</Badge>
                                                ))}
                                                {professor.subjects.length > 3 && (
                                                    <Badge variant="outline">+{professor.subjects.length - 3}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className={`h-4 w-4 ${getRatingColor(professor.ratingStats.averageGeneral)}`} />
                                                <span className={getRatingColor(professor.ratingStats.averageGeneral)}>
                                                    {professor.ratingStats.averageGeneral.toFixed(1)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className='dark:text-white' onClick={() => { setViewingProfessor(professor); setOpenViewDialog(true); }}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className='dark:text-white' onClick={() => handleEditProfessor(professor)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500" onClick={() => { setProfessorToDelete(professor); setOpenDeleteDialog(true); }}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No se encontraron profesores
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación Real */}
                <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoadingData}
                    >
                        <ChevronLeft className="h-4 w-4 dark:text-white" />
                    </Button>
                    <span className="dark:text-white">Página {currentPage} de {totalPages}</span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isLoadingData}
                    >
                        <ChevronRight className="h-4 w-4 dark:text-white" />
                    </Button>
                </div>

                {/* --- MODALES (Código similar pero usando modalSubjects) --- */}
                
                {/* Modal Editar/Crear */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="w-full">
                        <DialogHeader>
                            <DialogTitle>
                                {currentProfessor?._id ? "Editar Profesor" : "Nuevo Profesor"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input
                                    value={currentProfessor?.name || ''}
                                    onChange={(e) => setCurrentProfessor((prev: any) => ({ ...prev, name: e.target.value }))}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faculty">Facultad</Label>
                                <Select
                                    value={currentProfessor?.facultyId || ''}
                                    onValueChange={handleFacultyChange}
                                >
                                    <SelectTrigger id="faculty">
                                        <SelectValue placeholder="Selecciona una facultad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {faculties.map((faculty) => (
                                            <SelectItem key={faculty._id} value={faculty._id}>
                                                {faculty.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.faculty && <p className="text-red-500 text-sm">{errors.faculty}</p>}
                            </div>

                            <div className="space-y-2">
                                {/* IMPORTANTE: Pasamos modalSubjects que se carga dinámicamente */}
                                <SubjectSelector
                                    allSubjects={modalSubjects}
                                    selectedSubjects={currentProfessor?.subjects || []}
                                    facultyId={currentProfessor?.facultyId || ''}
                                    onChange={(newSubjects) => setCurrentProfessor((prev: any) => ({ ...prev, subjects: newSubjects }))}
                                    error={errors.subjects}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="cancel" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                            <Button variant="save" onClick={handleSaveProfessor} disabled={isLoadingAction}>
                                {isLoadingAction ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal View y Delete (Copiar tal cual de tu código original, solo asegúrate de importar las dependencias) */}
                {/* ... (Pega aquí los modales View y Delete que ya tenías, no requieren cambios lógicos) ... */}
                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de eliminar al profesor "{professorToDelete?.name}"?
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="Escribe el nombre del profesor para confirmar"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (professorToDelete && confirmName === professorToDelete.name) {
                                        try {
                                            await axios.delete(
                                                `${API_URL}/admin/faculty/${professorToDelete.facultyId}/professor/${professorToDelete._id}`,
                                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                            );
                                            fetchProfessors(); // Recargar lista
                                            setOpenDeleteDialog(false);
                                            setConfirmName('');
                                        } catch (error) {
                                            toast({
                                                title: 'Error',
                                                description: 'Error eliminando profesor',
                                                variant: 'destructive'
                                            });
                                        }
                                    }
                                }}
                                disabled={confirmName !== professorToDelete?.name}
                            >
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                 {/* Modal Ver Detalles */}
                <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detalles del Profesor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 bg-gray-300">
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(viewingProfessor?.name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-2xl font-bold mt-4">{viewingProfessor?.name}</h2>
                                <p className="text-muted-foreground">{viewingProfessor?.faculty}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Calificaciones</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">General</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageGeneral || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageGeneral || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Accesibilidad</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageAccessibility || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageAccessibility || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Asistencia</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageAttendance || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageAttendance || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Explicación</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageExplanation || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageExplanation || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Dificultad</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageDifficulty || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageDifficulty || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Materias Impartidas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingProfessor?.subjects.map((subject, index) => (
                                        <Badge key={index} variant="outline">{subject}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default Professors;