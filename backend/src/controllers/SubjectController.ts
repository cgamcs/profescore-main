import type { Request, Response } from 'express';
import Subject from '../models/Subject';
import Professor from '../models/Professor';
import Rating from '../models/Rating';
import Department from '../models/Department';
import Faculty from '../models/Faculty';
import cache from '../utils/simpleCache';

// Función para eliminar acentos y convertir a minúsculas
const normalizeName = (name: string): string => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export class SubjectController {
    static createSubject = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, credits, description, department, professors } = req.body;

            // Normalizar el nombre de la materia
            const normalizedName = normalizeName(name);

            // Verificar que no exista una materia con el mismo nombre normalizado en la misma facultad
            const existingSubject = await Subject.findOne({
                normalizedName: normalizedName,
                faculty: req.faculty.id
            });

            console.log('Intentando crear materia:', {
                nombreOriginal: name,
                nombreNormalizado: normalizedName,
                facultadActual: req.faculty.id
            });

            console.log('Resultado de búsqueda existente:', existingSubject);

            if (existingSubject) {
                res.status(400).json({ error: 'Ya existe una materia con ese nombre en esta facultad' });
                return;
            }

            // Verificar que el departamento pertenezca a la facultad solo si se proporciona
            if (department) {
                const departmentExists = await Department.findOne({
                    _id: department,
                    faculty: req.faculty.id
                });

                if (!departmentExists) {
                    res.status(400).json({ error: 'Departamento no válido' });
                    return;
                }
            }

            // Crear la materia
            const subject = new Subject({
                name,
                credits,
                description,
                department: department === "" ? undefined : department, // Ahora es opcional
                faculty: req.faculty.id,
                professors,
                normalizedName
            });

            console.log(subject)

            // Revisar si alguna de las operaciones falló
            const results = await Promise.allSettled([subject.save(), req.faculty.save()]);
            console.log('Resultados de guardado:', results);

            // Verificar si alguna operación falló
            const failed = results.some(result => result.status === 'rejected');
            if (failed) {
                const errors = results
                    .filter(result => result.status === 'rejected')
                    .map(result => (result as PromiseRejectedResult).reason);
                console.error('Errores al guardar:', errors);
                res.status(500).json({ error: 'Error al guardar los datos' });
                return;
            }

            // Si todo fue bien, confirmar
            console.log('Materia guardada con ID:', subject._id);
            res.send('Materia creada correctamente');
        } catch (error) {
            console.error('Error al crear materia:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static getFacultySubjects = async (req: Request, res: Response) => {
        try {
            const { facultyId } = req.params;
            const { limit, search } = req.query;

            // 1. Crear una Key de caché única para esta combinación de búsqueda
            // Si buscamos "mate", la key será diferente a si buscamos "física"
            const cacheKey = `facultySubjects:${facultyId}:${search || 'all'}:${limit || 'all'}`;
            
            let subjects = cache.get<any[]>(cacheKey);

            if (!subjects) {
                // 2. Construir el filtro dinámico
                const filter: any = { faculty: facultyId };

                if (search) {
                    // Usamos tu función existente para normalizar lo que escribe el usuario
                    const searchNormalized = normalizeName(search as string);
                    
                    // Buscamos coincidencias parciales (como LIKE en SQL) sobre tu campo optimizado
                    filter.normalizedName = { $regex: searchNormalized, $options: 'i' };
                }

                // 3. Preparar la consulta base
                let query = Subject.find(filter)
                    .populate('department', 'name')
                    .populate('professors', 'name');

                // 4. Aplicar el límite SOLO si se envía (ej: ?limit=6)
                // Esto es lo que salvará a tu CPU de 0.5 vCores
                if (limit) {
                    const limitNum = parseInt(limit as string);
                    if (!isNaN(limitNum)) {
                        query = query.limit(limitNum);
                    }
                }

                // Ejecutar la consulta
                subjects = await query;

                // Guardar en caché (puedes ajustar el tiempo si es búsqueda)
                cache.set(cacheKey, subjects, 600);
            }

            res.json(subjects);
        } catch (error) {
            console.error('Error al traer materias de la facultad:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static getAllSubjects = async (req: Request, res: Response) => {
        try {
            // 1. Obtener parámetros de query
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const skip = (page - 1) * limit;

            // 2. Construir Query de Mongoose
            let query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            // 3. Ejecutar conteo y búsqueda
            const totalDocs = await Subject.countDocuments(query);
            const totalPages = Math.ceil(totalDocs / limit);

            const subjects = await Subject.find(query)
                .skip(skip)
                .limit(limit)
                .populate('faculty', 'name abbreviation') // Traemos datos de facultad
                .lean(); // .lean() devuelve JSON plano (más rápido)

            // 4. Responder con estructura paginada
            res.json({
                data: subjects,
                meta: {
                    total: totalDocs,
                    page,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });

        } catch (error) {
            console.error('Error al obtener materias:', error);
            res.status(500).json({ error: 'Hubo un error al obtener las materias' });
        }
    };

    static getSubjectProfessors = async (req: Request, res: Response) => {
        try {
            const { subjectId } = req.params;

            const subject = await Subject.findById(subjectId)
                .populate({
                    path: 'professors',
                    select: 'name ratingStats',
                    match: { faculty: req.params.facultyId } // Asegurar que pertenecen a la facultad
                })
                .populate('department', 'name');

            if (!subject) {
                res.status(404).json({ error: 'Materia no encontrada' });
                return;
            }

            // Filtrar profesores que coincidan con la facultad
            const filteredProfessors = subject.professors.filter(p => p !== null);

            res.json(filteredProfessors);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener profesores' });
        }
    };

    static getSubjectById = async (req: Request, res: Response) => {
        try {
            res.json(req.subject);
        } catch (error) {
            console.error('Error al traer materia por ID:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static updateSubject = async (req: Request, res: Response) => {
        try {
            const { name, department, credits, description } = req.body;

            // Verificar que el departamento pertenezca a la facultad solo si se proporciona
            if (department) {
                const departmentExists = await Department.findOne({
                    _id: department,
                    faculty: req.faculty.id
                });

                if (!departmentExists) {
                    res.status(400).json({ error: 'Departamento no válido' });
                    return;
                }
            }

            // Actualizar la materia
            req.subject.name = name;
            req.subject.department = department;
            req.subject.credits = credits;
            req.subject.description = description;
            await req.subject.save();

            res.send('Materia actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar materia:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static deleteSubject = async (req: Request, res: Response) => {
        try {
            // Eliminar la materia de la facultad
            req.faculty.subjects = req.faculty.subjects.filter(subject => subject.id.toString() !== req.subject.id.toString());

            // Eliminar la materia de todos los profesores relacionados
            await Professor.updateMany({ subjects: req.subject.id }, { $pull: { subjects: req.subject.id } });

            //  Eliminar todas las calificaciones relacionadas con la materia
            await Rating.deleteMany({ subject: req.subject.id });

            // Ejecutar todas las operaciones juntas
            await Promise.allSettled([
                req.subject.deleteOne(), // Eliminar materia
                req.faculty.save()
            ]);

            res.json({
                message: 'Materia eliminada y relaciones actualizadas',
                deletedSubject: req.subject.name
            });
        } catch (error) {
            console.error('Error al eliminar materia:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
}
