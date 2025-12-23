import { useState, useEffect, useCallback } from 'react';
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
import { Plus, MoreHorizontal, Book, Users, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

// API base URL
const API_URL = import.meta.env.VITE_API_URL;

// Interfaces
interface IFaculty {
  _id: string;
  name: string;
  abbreviation: string;
}

interface ISubject {
  _id: string;
  name: string;
  credits: number;
  description: string;
  faculty: IFaculty | null;
  professors: string[]; // IDs de profesores
}

const Subjects = () => {
  const { toast } = useToast();
  
  // Data states
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [faculties, setFaculties] = useState<IFaculty[]>([]); // Facultades para el dropdown
  
  // Pagination & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // UI states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Partial<ISubject>>({ faculty: null });
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // 1. DEBOUNCE: Esperar a que el usuario termine de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchTerm);
        setCurrentPage(1); // Reset a página 1 al buscar
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. FETCH SUBJECTS (Server-Side Pagination)
  const fetchSubjects = useCallback(async () => {
      try {
          setIsLoadingData(true);
          const token = localStorage.getItem('token');
          
          const response = await axios.get(`${API_URL}/admin/subjects`, {
              params: {
                  page: currentPage,
                  limit: 10,
                  search: debouncedSearch
              },
              headers: { Authorization: `Bearer ${token}` }
          });

          setSubjects(response.data.data);
          setTotalPages(response.data.meta.totalPages);
      } catch (error) {
          toast({ title: 'Error', description: 'No se pudieron cargar las materias', variant: 'destructive' });
      } finally {
          setIsLoadingData(false);
      }
  }, [currentPage, debouncedSearch, toast]);

  // Ejecutar fetch cuando cambie página o búsqueda
  useEffect(() => {
      fetchSubjects();
  }, [fetchSubjects]);

  // 3. FETCH FACULTIES (Solo una vez para el dropdown)
  // Las facultades son pocas (<100), se pueden cargar todas sin problema.
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
  
  // --- HANDLERS ---

  const handleDialogOpen = (subject?: ISubject) => {
    setCurrentSubject(subject || { faculty: null, name: '', credits: 0, description: '' });
    setErrors({});
    setOpenDialog(true);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!currentSubject.name?.trim()) newErrors.name = 'Nombre obligatorio';
    if (!currentSubject.credits || currentSubject.credits < 1 || currentSubject.credits > 22) {
      newErrors.credits = 'Créditos entre 1-22';
    }
    // Verificación robusta del ID de la facultad
    if (!currentSubject.faculty?._id && !currentSubject.faculty) newErrors.faculty = 'Facultad obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveSubject = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoadingAction(true);
      const isEdit = !!currentSubject._id;
      
      // Aseguramos obtener el ID correcto de la facultad
      const facultyId = currentSubject.faculty?._id || (currentSubject.faculty as any);

      const url = isEdit
        ? `${API_URL}/admin/faculty/${facultyId}/subject/${currentSubject._id}`
        : `${API_URL}/admin/faculty/${facultyId}/subject`;
        
      await axios[isEdit ? 'put' : 'post'](
        url, 
        currentSubject, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast({
        title: `Materia ${isEdit ? 'actualizada' : 'creada'}`,
        description: `La materia "${currentSubject.name}" se ha guardado correctamente`,
      });
      
      setOpenDialog(false);
      fetchSubjects(); // Recargar la tabla actual
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al procesar la solicitud',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAction(false);
    }
  };
  
  const handleDeleteSubject = async () => {
    if (!currentSubject._id || !currentSubject.faculty) return;
    
    try {
      setIsLoadingAction(true);
      // Extraemos ID de facultad de forma segura
      const facultyId = currentSubject.faculty._id || (currentSubject.faculty as unknown as string);

      await axios.delete(
        `${API_URL}/admin/faculty/${facultyId}/subject/${currentSubject._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      toast({ title: 'Materia eliminada', description: `Materia eliminada correctamente` });
      
      setOpenDeleteDialog(false);
      setConfirmationInput('');
      fetchSubjects(); // Recargar la tabla
    } catch (error) {
      toast({ title: 'Error', description: 'Error al eliminar la materia', variant: 'destructive' });
    } finally {
      setIsLoadingAction(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl dark:text-white font-bold">Materias</h1>
          <Button 
            className="bg-black dark:bg-indigo-600 text-white hover:cursor-pointer" 
            onClick={() => handleDialogOpen()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Materia
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
                <TableHead>Materia</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Profesores</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData ? (
                 // Skeleton simple
                 [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5} className="h-16 text-center animate-pulse">Cargando...</TableCell></TableRow>
                 ))
              ) : subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-[#ffffff0d]" key={subject._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                          <Book className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{subject.faculty?.abbreviation || 'N/A'}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{subject.professors?.length || 0}</span>
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
                          <DropdownMenuItem
                            className="dark:text-white"
                            onClick={() => handleDialogOpen(subject)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => {
                              setCurrentSubject(subject);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No se encontraron materias
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isLoadingData}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
                <ChevronLeft className="h-4 w-4 dark:text-white" />
            </Button>
            <span className="text-sm dark:text-white">
                Página {currentPage} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || isLoadingData}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
                <ChevronRight className="h-4 w-4 dark:text-white" />
            </Button>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentSubject?._id ? "Editar Materia" : "Nueva Materia"}
              </DialogTitle>
              <DialogDescription>
                {currentSubject?._id 
                  ? "Modifica los detalles de la materia" 
                  : "Completa los campos requeridos"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-white">Nombre de la Materia <span className="text-red-500">*</span></Label>
                <Input
                  value={currentSubject?.name || ''}
                  onChange={(e) => setCurrentSubject(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Créditos <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={currentSubject?.credits || ''}
                  onChange={(e) => setCurrentSubject(prev => ({
                    ...prev,
                    credits: Number(e.target.value)
                  }))}
                  className={errors.credits ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.credits && <p className="text-red-500 text-sm">{errors.credits}</p>}
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Facultad <span className="text-red-500">*</span></Label>
                <Select
                  // Manejo robusto del valor seleccionado (si es objeto o string)
                  value={currentSubject?.faculty?._id || (typeof currentSubject?.faculty === 'string' ? currentSubject.faculty : '')}
                  onValueChange={(value) => {
                    const faculty = faculties.find(f => f._id === value);
                    setCurrentSubject(prev => ({ ...prev, faculty: faculty || null }));
                  }}
                >
                  <SelectTrigger className={errors.faculty ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {faculties.map(faculty => (
                      <SelectItem key={faculty._id} value={faculty._id} className="hover:bg-gray-100">
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && <p className="text-red-500 text-sm">{errors.faculty}</p>}
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Descripción</Label>
                <Input
                  value={currentSubject?.description || ''}
                  onChange={(e) => setCurrentSubject(prev => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="cancel" 
                onClick={() => setOpenDialog(false)}
                disabled={isLoadingAction}
              >
                Cancelar
              </Button>
              <Button 
                variant="save"
                onClick={handleSaveSubject}
                disabled={isLoadingAction}
              >
                {isLoadingAction ? 'Guardando...' : currentSubject?._id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                Escribe el nombre de la materia para confirmar:{" "}
                <strong>{currentSubject?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Nombre de la materia"
            />
            <DialogFooter>
              <Button 
                variant="cancel" 
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setConfirmationInput('');
                }}
                disabled={isLoadingAction}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSubject}
                disabled={isLoadingAction || confirmationInput !== currentSubject?.name}
              >
                {isLoadingAction ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Subjects;