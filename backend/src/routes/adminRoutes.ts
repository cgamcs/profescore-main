import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { AdminController } from '../controllers/AdminController';
import { adminAuth } from '../middleware/adminAuth';
import { FacultyController } from '../controllers/FacultyController';
import { SubjectController } from '../controllers/SubjectController';
import { ProfessorController } from '../controllers/ProfessorController';
import { facultyExists } from '../middleware/faculty';
import { subjectBelongsToFaculty, subjectExists } from '../middleware/subject';
import { professorExists } from '../middleware/professor';
import { DashboardController } from '../controllers/DashboardController';
import { RatingController } from '../controllers/RatingController';

const router: Router = Router();

// --- Rutas de autenticación de Admin ---
// Ruta pública para que crear un administrador
router.post('/signup',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('name').notEmpty().withMessage('El nombre es obligatoria'),
    handleInputErrors,
    AdminController.createAdmin
);
// Ruta pública para que el administrador inicie sesión
router.post('/login',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AdminController.adminLogin
);

// --- Rutas administrativas (protegidas) ---
router.use(adminAuth);

// Get dashboard statistics
router.get('/dashboard-stats', DashboardController.getDashboardStats);

// Get recent activities
router.get('/recent-activities', DashboardController.getRecentActivities);

// **** FACULTADES ****

// Crear una nueva facultad
router.post('/faculty',
    body('name').notEmpty().withMessage('El nombre de la facultad es obligatorio'),
    body('abbreviation').notEmpty().withMessage('La abreviación de la facultad es obligatoria'),
    handleInputErrors,
    FacultyController.createFaculty
);

// Obtener todas las facultades
router.get('/faculty', FacultyController.getAllFaculties);

// Revisar si el ID de la Facultad existe antes de procesar las rutas
router.param('facultyId', facultyExists);

// Obtener facultad por id
router.get('/faculty/:facultyId',
    param('facultyId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    FacultyController.getFacultyById
);

// Actualizar facultad
router.put('/faculty/:facultyId',
    param('facultyId').isMongoId().withMessage('ID no válido'),
    body('name').notEmpty().withMessage('El nombre de la facultad es obligatorio'),
    body('abbreviation').notEmpty().withMessage('La abreviación de la facultad es obligatoria'),
    handleInputErrors,
    FacultyController.editFaculty
);

// Eliminar facultad
router.delete('/faculty/:facultyId',
    param('facultyId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    FacultyController.deleteFaculty
);

// Crear un departamento
router.post('/faculty/:facultyId/departments',
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    handleInputErrors,
    FacultyController.addDepartment
);

// Obtener departamentos por facultad
router.get('/faculty/:facultyId/departments', FacultyController.getFacultyDepartments);

// **** MATERIAS ****

// Obtener todas las materias de todas las facultades
router.get('/subjects', SubjectController.getAllSubjects);

// Crear una materia
router.post('/faculty/:facultyId/subject',
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    handleInputErrors,
    SubjectController.createSubject
);

// Middlewares para validar Materias
router.param('subjectId', subjectExists); // Verificar si la Materia existe
router.param('subjectId', subjectBelongsToFaculty); // Verificar que la Materia pertenezca a la Facultad

router.get('/faculty/:facultyId/subjects', SubjectController.getFacultySubjects);

// Obtener materia por id
router.get('/faculty/:facultyId/subject/:subjectId',
    param('subjectId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    SubjectController.getSubjectById
);

// Actualizar materia
router.put('/faculty/:facultyId/subject/:subjectId',
    body('name').notEmpty().withMessage('El nombre de la materia es obligatorio'),
    body('credits').isNumeric().withMessage('Los créditos deben ser un número'),
    handleInputErrors,
    SubjectController.updateSubject
);

// Eliminar materia
router.delete('/faculty/:facultyId/subject/:subjectId',
    param('subjectId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    SubjectController.deleteSubject
);

// **** PROFESORES ****

// Crear un profesor con una sola materia
router.post('/faculty/:facultyId/professor',
    body('subject').isMongoId().withMessage('ID de materia inválido'),
    body('name').notEmpty().withMessage('El nombre del profesor es obligatorio'),
    handleInputErrors,
    ProfessorController.createProfessor
);

// Crear un profesor con múltiples materias
router.post('/faculty/:facultyId/professor/multiple',
    body('subjects').isArray().withMessage('Debe ser un arreglo de materias'),
    body('subjects.*').isMongoId().withMessage('ID de materia inválido'),
    body('name').notEmpty().withMessage('El nombre del profesor es obligatorio'),
    handleInputErrors,
    ProfessorController.createProfessorWithMultipleSubjects
);

// Obtener todos los profesores de todas las facultades con detalles
router.get('/professors', ProfessorController.getAllProfessorsWithDetails);

// Obtener todos los profesores de todas las facultades
// router.get('/professors', ProfessorController.getAllProfessors);

// Obtener todos los profesores de una facultad
router.get('/faculty/:facultyId/professor', ProfessorController.getFacultyProfessors);

// Revisar si el ID del Profesor existe antes de procesar las rutas
router.param('professorId', professorExists);

// Obtener profesor por id
router.get('/faculty/:facultyId/professor/:professorId',
    param('professorId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProfessorController.getProfessorById
);

// Actualizar profesor
router.put('/faculty/:facultyId/professor/:professorId',
    body('name').notEmpty().withMessage('El nombre del profesor es obligatorio'),
    handleInputErrors,
    ProfessorController.updateProfessor
);

// Eliminar profesor
router.delete('/faculty/:facultyId/professor/:professorId',
    param('professorId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProfessorController.deleteProfessor
);

// **** REPORTES ****
router.get('/reports', RatingController.getAllReports);
router.get('/reports/:reportId', RatingController.getReportById);

// Nuevas rutas para manejar reportes
router.delete('/reports/:reportId/delete-comment', RatingController.deleteReportedRating);
router.put('/reports/:reportId/reject', RatingController.rejectReport);

export default router;