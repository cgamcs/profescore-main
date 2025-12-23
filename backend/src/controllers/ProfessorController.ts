import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import Faculty from '../models/Faculty';
import Professor from '../models/Professor';
import Subject from '../models/Subject';
import Rating from '../models/Rating';
import cache from '../utils/simpleCache';

export class ProfessorController {
    static createProfessor = async (req: Request, res: Response) => {
        try {
            const faculty = req.faculty;
            const { name, department, subject: subjectId } = req.body;
    
            if (!name || typeof name !== 'string') {
                res.status(400).json({ error: 'El nombre del profesor es requerido' });
                return
            }
    
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                res.status(404).json({ error: 'Materia no encontrada' });
                return
            }
    
            // Normalizar el nombre para búsqueda (quitar acentos, convertir a minúsculas)
            const normalizedNameSearch = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
            // Formatear el nombre en capitalize para guardarlo
            const formattedName = name.trim().split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    
            // Buscar profesor existente con nombre normalizado
            const existingProfessors = await Professor.find({ faculty: faculty.id });
            const existingProfessor = existingProfessors.find(prof => {
                const profNormalizedName = prof.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return profNormalizedName === normalizedNameSearch;
            });
    
            if (existingProfessor) {
                const subjectIdStr = subject.id.toString();
                const existingSubjects = existingProfessor.subjects.map(id => id.toString());
                if (!existingSubjects.includes(subjectIdStr)) {
                    existingProfessor.subjects.push(subject.id);
                    await existingProfessor.save();
                }
    
                const professorIdStr = existingProfessor.id.toString();
                const subjectProfessors = subject.professors.map(id => id.toString());
                if (!subjectProfessors.includes(professorIdStr)) {
                    subject.professors.push(existingProfessor.id);
                    await subject.save();
                }
    
                res.status(201).send('Profesor creado correctamente');
                return
            }
    
            const newProfessor = new Professor({
                name: formattedName,
                department: department === "" ? undefined : department,
                faculty: faculty.id,
                subjects: [subject.id]
            });
    
            subject.professors.push(newProfessor.id);
    
            const savedProfessor = await newProfessor.save();
            console.log("Profesor guardado con éxito:", savedProfessor);
            
            const savedSubject = await subject.save();
            console.log("Materia actualizada con éxito:", savedSubject);
            
            // Verificar de nuevo después de guardar
            const verifyProfessor = await Professor.findById(newProfessor._id);
            console.log("Verificación del profesor guardado:", verifyProfessor);
    
            res.json({
                message: 'Profesor creado y asignado a la materia',
                professor: newProfessor
            });
        } catch (error) {
            console.error('Error en createProfessor:', error.message);
            res.status(500).json({ error: 'Hubo un error al crear el profesor' });
        }
    }
    
    static createProfessorWithMultipleSubjects = async (req: Request, res: Response) => {
        try {
            const faculty = req.faculty;
            const { name, department, subjects: subjectIds } = req.body;
    
            if (!name || typeof name !== 'string') {
                res.status(400).json({ error: 'El nombre del profesor es requerido' });
                return
            }
    
            console.log('Received data for multiple subjects:', { name, department, subjectIds });
    
            const subjects = await Subject.find({ _id: { $in: subjectIds } });
            if (subjects.length !== subjectIds.length) {
                res.status(404).json({ error: 'Algunas materias no fueron encontradas' });
                return
            }
    
            // Normalizar el nombre para búsqueda (quitar acentos, convertir a minúsculas)
            const normalizedNameSearch = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
            // Formatear el nombre en capitalize para guardarlo
            const formattedName = name.trim().split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    
            // Buscar profesor existente con nombre normalizado
            const existingProfessors = await Professor.find({ faculty: faculty.id });
            const existingProfessor = existingProfessors.find(prof => {
                const profNormalizedName = prof.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return profNormalizedName === normalizedNameSearch;
            });
    
            if (existingProfessor) {
                const existingSubjectIds = existingProfessor.subjects.map(id => id.toString());
                subjects.forEach(subject => {
                    const subjectIdStr = subject.id.toString();
                    if (!existingSubjectIds.includes(subjectIdStr)) {
                        existingProfessor.subjects.push(subject.id);
                    }
                    const professorIdStr = existingProfessor.id.toString();
                    const subjectProfessors = subject.professors.map(id => id.toString());
                    if (!subjectProfessors.includes(professorIdStr)) {
                        subject.professors.push(existingProfessor.id);
                    }
                });
                await existingProfessor.save();
                await Promise.allSettled(subjects.map(subject => subject.save()));
                res.status(201).send('Profesor actualizado con nuevas materias');
                return
            }
    
            const newProfessor = new Professor({
                name: formattedName,
                department,
                faculty: faculty.id,
                subjects: subjects.map(subject => subject.id)
            });
    
            subjects.forEach(subject => {
                subject.professors.push(newProfessor.id);
            });
    
            await Promise.allSettled([
                newProfessor.save(),
                ...subjects.map(subject => subject.save())
            ]);
    
            console.log('Professor saved:', newProfessor);
            console.log('Subjects updated:', subjects);
    
            res.json({
                message: 'Profesor creado y asignado a las materias',
                professor: newProfessor
            });
    
        } catch (error) {
            console.error('Error en createProfessorWithMultipleSubjects:', error.message);
            res.status(500).json({ error: 'Hubo un error al crear el profesor' });
        }
    }

    static getAllProfessorsWithDetails = async (req: Request, res: Response) => {
        try {
            // Populate with type assertion to tell TypeScript about the expected structure
            const professors = await Professor.find()
                .populate({
                    path: 'subjects',
                    select: 'name' // Explicitly select the name field
                })
                .populate({
                    path: 'faculty',
                    select: 'name' // Explicitly select the name field
                });

            // Map the professors with type safety
            const professorsWithDetails = professors.map(professor => ({
                _id: professor._id,
                name: professor.name,
                faculty: professor.faculty ? (professor.faculty as any).name : 'Sin facultad',
                subjects: professor.subjects.map(subject => (subject as any).name),
                ratingStats: professor.ratingStats
            }));

            res.json(professorsWithDetails);
        } catch (error) {
            console.error('Error al obtener los profesores:', error);
            res.status(500).json({ error: 'Hubo un error al obtener los profesores' });
        }
    }

    static getAllProfessors = async (req: Request, res: Response) => {
        try {
            const professors = await Professor.find()
                .populate('department', 'name')
                .populate('subjects', 'name')
                .populate('faculty', 'name');

            res.json(professors);
        } catch (error) {
            console.error('Error al traer todas las materias:', error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    };

    static getFacultyProfessors = async (req: Request, res: Response) => {
        try {
            const { facultyId } = req.params;
            const { limit, search } = req.query;

            // Creamos una key de caché compuesta para no mezclar búsquedas
            const cacheKey = `facultyProfessors:${facultyId}:${search || 'all'}:${limit || 'all'}`;
            let professors = cache.get<any[]>(cacheKey);

            if (!professors) {
                // 1. Construir query base
                const query: any = { faculty: facultyId };

                // 2. Si hay búsqueda, filtrar por nombre (Case insensitive)
                if (search) {
                    // Usamos regex 'i' (insensitive) para buscar coincidencias parciales
                    // Nota: Para optimización máxima futura, agregaremos 'normalizedName' al modelo,
                    // pero esto funciona YA con tus datos actuales.
                    query.name = { $regex: search, $options: 'i' };
                }

                // 3. Preparar la consulta a Mongoose
                let mongooseQuery = Professor.find(query)
                    // Solo traemos los campos necesarios para la tarjeta (ahorro de ancho de banda)
                    .select('name ratingStats faculty subjects')
                    .populate('subjects', 'name') // Populate ligero
                    .populate('faculty', 'name');

                // 4. Aplicar límite si existe
                if (limit) {
                    const limitNum = parseInt(limit as string);
                    if (!isNaN(limitNum)) {
                        mongooseQuery = mongooseQuery.limit(limitNum);
                    }
                }

                professors = await mongooseQuery;
                
                // Cachear resultado por 60 segundos (menos tiempo para búsquedas dinámicas)
                cache.set(cacheKey, professors, 60);
            }

            res.json(professors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al mostrar profesores' });
        }
    }

    static getProfessorById = async (req: Request, res: Response) => {
        try {
            res.json(req.professor);
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al buscar el profesor' });
        }
    }

    static updateProfessor = async (req: Request, res: Response) => {
        try {
            const professor = req.professor;
            const { subjects: newSubjects, ...rest } = req.body;

            if (rest.name) {
                const existing = await Professor.findOne({
                    name: rest.name.trim(),
                    faculty: professor.faculty,
                    _id: { $ne: professor.id }
                });

                if (existing) {
                    res.status(400).json({ error: 'Ya existe un profesor con este nombre' });
                    return;
                }
            }

            // Update basic professor information
            Object.assign(professor, rest);

            // Handle subjects update
            if (newSubjects && Array.isArray(newSubjects)) {
                // Convert and validate subject IDs
                const validSubjects = newSubjects
                    .filter(id => mongoose.Types.ObjectId.isValid(id))
                    .map(id => new mongoose.Types.ObjectId(id));

                if (validSubjects.length !== newSubjects.length) {
                    res.status(400).json({ error: "Algunos IDs de materias son inválidos" });
                    return;
                }

                // Replace subjects array with new subjects
                professor.subjects = validSubjects;

                // Update the subjects collection to reference this professor
                await Subject.updateMany(
                    { _id: { $in: validSubjects } },
                    { $addToSet: { professors: professor._id } }
                );

                // Remove this professor from subjects that are no longer associated
                await Subject.updateMany(
                    {
                        _id: { $nin: validSubjects },
                        professors: professor._id
                    },
                    { $pull: { professors: professor._id } }
                );
            }

            await professor.save();

            // Fetch the updated professor with populated fields to return
            const updatedProfessor = await Professor.findById(professor._id)
                .populate('subjects', 'name')
                .populate('department', 'name');

            res.json({
                message: 'Profesor actualizado correctamente',
                professor: updatedProfessor
            });
        } catch (error) {
            console.error('Error updating professor:', error);
            res.status(500).json({ error: 'Hubo un error al actualizar el profesor' });
        }
    }

    static deleteProfessor = async (req: Request, res: Response) => {
        try {
            await Promise.allSettled([
                req.professor.deleteOne(),
                Rating.deleteMany({ professor: req.professor.id }),
                Subject.updateMany({ professors: req.professor.id }, { $pull: { professors: req.professor.id } })
            ]);

            res.send('Profesor eliminado correctamente');
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al eliminar el profesor' });
        }
    }
}
