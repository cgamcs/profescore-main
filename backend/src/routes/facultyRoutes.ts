import { Router } from 'express';
import { body, param } from 'express-validator';
import { FacultyController } from '../controllers/FacultyController';
import { SubjectController } from '../controllers/SubjectController';
import { ProfessorController } from '../controllers/ProfessorController';
import { RatingController } from '../controllers/RatingController';
import { handleInputErrors } from '../middleware/validation';
import { facultyExists } from '../middleware/faculty';
import { subjectExists, subjectBelongsToFaculty } from '../middleware/subject';
import { professorExists } from '../middleware/professor';
import { ratingExists, ratingBelongsToProfessor } from '../middleware/rating';
import { verifyRecaptcha } from '../controllers/RecaptchaController';

const router: Router = Router();

router.param('facultyId', facultyExists);

router.get('/', FacultyController.getHomeData);

router.get('/:facultyId',
  param('facultyId').isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  FacultyController.getFacultyById
);

router.get('/:facultyId/departments', FacultyController.getFacultyDepartments);

router.get('/:facultyId/subjects', SubjectController.getFacultySubjects);

router.post('/:facultyId/subjects',
  body('name').notEmpty().withMessage('El nombre de la materia es obligatorio'),
  body('credits').isNumeric().withMessage('Los créditos deben ser numéricos'),
  handleInputErrors,
  SubjectController.createSubject
);

router.param('subjectId', subjectExists);
router.param('subjectId', subjectBelongsToFaculty);

router.get('/:facultyId/subjects/:subjectId',
  param('subjectId').isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  SubjectController.getSubjectById
);

router.get('/:facultyId/subjects/:subjectId/professors', SubjectController.getSubjectProfessors);

router.get('/:facultyId/professors', ProfessorController.getFacultyProfessors);

router.param('professorId', professorExists);

router.get('/:facultyId/professors/:professorId',
  param('professorId').isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  ProfessorController.getProfessorById
);

// Crear un profesor con múltiples materias
router.post('/:facultyId/professor/multiple',
  body('subjects').isArray().withMessage('Debe ser un arreglo de materias'),
  body('subjects.*').isMongoId().withMessage('ID de materia inválido'),
  body('name').notEmpty().withMessage('El nombre del profesor es obligatorio'),
  handleInputErrors,
  ProfessorController.createProfessorWithMultipleSubjects
);

router.get('/:facultyId/professors/:professorId/ratings', RatingController.getProfessorRatings);

router.post('/:facultyId/professors/:professorId/ratings',
  body('general').isFloat({ min: 1, max: 5 }).withMessage('La calificación general debe estar entre 1 y 5'),
  body('subject').isMongoId().withMessage('El ID de la materia es inválido'),
  body('captcha').notEmpty().withMessage('El CAPTCHA es obligatorio'),
  handleInputErrors,
  verifyRecaptcha,
  RatingController.createRating
);

router.param('ratingId', ratingExists);

router.post('/:facultyId/professors/:professorId/ratings/:ratingId/vote',
  param('ratingId').isMongoId(),
  handleInputErrors,
  ratingExists,
  ratingBelongsToProfessor,
  RatingController.voteHelpful
);

// Ruta para crear un reporte
router.post('/:facultyId/professors/:professorId/ratings/:ratingId/report',
  param('ratingId').isMongoId().withMessage('ID de calificación inválido'),
  body('reasons').isArray().withMessage('Los motivos deben ser un array'),
  body('reportComment').optional().isString().withMessage('El comentario del reporte debe ser un string'),
  handleInputErrors,
  RatingController.createReport
);

export default router;