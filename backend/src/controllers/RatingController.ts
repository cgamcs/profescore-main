import { Request, Response } from 'express';
import Rating from '../models/Rating';
import Professor from '../models/Professor';
import Subject from '../models/Subject';
import mongoose from 'mongoose';
import Report from '../models/Report';

export class RatingController {
  static createRating = async (req: Request, res: Response) => {
    try {
      console.log('Datos recibidos en el backend:', req.body);
      console.log('Params:', req.params);

      const { general, explanation, accessibility, difficulty, attendance, wouldRetake, comment, subject } = req.body;
      const { facultyId, professorId } = req.params;

      if (!subject || !professorId) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
      }

      const [professor, subjectDoc] = await Promise.all([
        Professor.findById(professorId),
        Subject.findById(subject)
      ]);

      if (!professor || !subjectDoc) {
        res.status(404).json({ error: 'Profesor o materia no encontrados' });
        return;
      }

      // Convert subject IDs to strings for comparison
      const professorSubjectIds = professor.subjects.map(s => s.toString());

      // Check if the subject is not already in the professor's subjects array
      if (!professorSubjectIds.includes(subject.toString())) {
        console.log('Añadiendo materia al profesor:', subject);
        professor.subjects.push(subject);
        await professor.save();
        console.log('Materias del profesor después de guardar:', professor.subjects);
      }

      // Check if the professor is not already in the subject's professors array
      const subjectProfessorIds = subjectDoc.professors.map(p => p.toString());
      if (!subjectProfessorIds.includes(professorId.toString())) {
        console.log('Añadiendo profesor a la materia:', professorId);
        subjectDoc.professors.push(new mongoose.Types.ObjectId(professorId));
        await subjectDoc.save();
        console.log('Profesores de la materia después de guardar:', subjectDoc.professors);
      }

      const newRating = new Rating({
        general,
        explanation,
        accessibility,
        difficulty,
        attendance,
        wouldRetake,
        comment,
        subject,
        professor: professorId,
      });

      const savedRating = await newRating.save();
      console.log('Calificación guardada:', savedRating);

      await this.updateProfessorStats(professorId);

      res.status(201).json(savedRating);
    } catch (error) {
      console.error('Error al crear calificación:', error);
      res.status(500).json({
        error: 'Error al crear la calificación',
        details: error.message
      });
    }
  }

  static getProfessorRatings = async (req: Request, res: Response) => {
    try {
      const { professorId } = req.params;
      // 1. Obtener parámetros de paginación (default: página 1, 10 por página)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // 2. Consulta con paginación
      const ratings = await Rating.find({ professor: professorId })
        .populate('subject', 'name credits')
        .sort({ createdAt: -1 })
        .skip(skip)     // Saltar los anteriores
        .limit(limit);  // Traer solo el límite

      // 3. Contar total para saber si hay más páginas
      const totalRatings = await Rating.countDocuments({ professor: professorId });
      const hasNextPage = (skip + ratings.length) < totalRatings;

      // 4. Devolver estructura paginada
      res.json({
        ratings,
        nextPage: hasNextPage ? page + 1 : undefined,
        total: totalRatings
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
  }

  static deleteReportedRating = async (req: Request, res: Response) => {
    try {
      console.log('Petición de eliminación de comentario reportado');
      console.log('Params:', req.params);

      const { reportId } = req.params;

      if (!reportId) {
        res.status(400).json({ error: 'Se requiere ID del reporte' });
        return
      }

      // 1. Encontrar el reporte
      const report = await Report.findById(reportId);

      if (!report) {
        res.status(404).json({ error: 'Reporte no encontrado' });
        return
      }

      // 2. Obtener el ID del comentario y del profesor
      const commentId = report.commentId;
      const professorId = report.teacherId;

      if (!commentId || !professorId) {
        res.status(400).json({ error: 'El reporte no contiene IDs válidos de comentario o profesor' });
        return
      }

      // 3. Eliminar el comentario (rating)
      await Rating.findByIdAndDelete(commentId);
      console.log('Comentario eliminado:', commentId);

      // 4. Actualizar el estado del reporte a 'deleted'
      report.status = 'deleted';
      await report.save();
      console.log('Reporte marcado como eliminado');

      // 5. Actualizar las estadísticas del profesor
      await this.updateProfessorStats(professorId.toString());
      console.log('Estadísticas del profesor actualizadas');

      res.status(200).json({
        message: 'Comentario eliminado correctamente',
        report: report
      });
    } catch (error) {
      console.error('Error al eliminar comentario reportado:', error);
      res.status(500).json({
        error: 'Error al eliminar el comentario reportado',
        details: error.message
      });
    }
  }

  static voteHelpful = async (req: Request, res: Response) => {
    try {
      const { type, userId } = req.body; // Obtener userId del cuerpo
      const { ratingId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'ID de usuario requerido' });
        return;
      }

      const rating = await Rating.findById(ratingId);
      if (!rating) {
        res.status(404).json({ error: 'Calificación no encontrada' });
        return;
      }

      let updateQuery = {};

      if (type === 1) {
        if (rating.likes.includes(userId)) {
          updateQuery = { $pull: { likes: userId } };
        } else {
          updateQuery = {
            $addToSet: { likes: userId },
            $pull: { dislikes: userId }
          };
        }
      } else {
        res.status(400).json({ error: 'Tipo de voto inválido' });
        return;
      }

      const updatedRating = await Rating.findByIdAndUpdate(
        ratingId,
        updateQuery,
        { new: true }
      ).populate('subject', 'name');

      res.json(updatedRating);
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar voto' });
    }
  }

  private static updateProfessorStats = async (professorId: string) => {
    const stats = await Rating.aggregate([
      { $match: { professor: new mongoose.Types.ObjectId(professorId) } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageGeneral: { $avg: "$general" },
          averageExplanation: { $avg: "$explanation" },
          averageAccessibility: { $avg: "$accessibility" },
          averageDifficulty: { $avg: "$difficulty" },
          averageAttendance: { $avg: "$attendance" },
          wouldRetakeCount: { $sum: { $cond: ["$wouldRetake", 1, 0] } }
        }
      }
    ]);

    // Si no hay estadísticas (no hay comentarios), establecer valores por defecto
    if (stats.length === 0) {
      await Professor.findByIdAndUpdate(professorId, {
        ratingStats: {
          totalRatings: 0,
          averageGeneral: 0,
          averageExplanation: 0,
          averageAccessibility: 0,
          averageDifficulty: 0,
          averageAttendance: 0,
          wouldRetakeCount: 0,
          wouldRetakePercentage: 0
        }
      });
    } else {
      await Professor.findByIdAndUpdate(professorId, {
        ratingStats: {
          ...stats[0],
          wouldRetakePercentage: (stats[0].wouldRetakeCount / stats[0].totalRatings) * 100
        }
      });
    }
  }

  static createReport = async (req: Request, res: Response) => {
    try {
      const { commentId, reasons, reportComment } = req.body;
      console.log(req.body)
      // Validar que la calificación exista
      const rating = await Rating.findById(commentId);
      console.log(rating)
      if (!rating) {
        res.status(404).json({ message: 'Calificación no encontrada' });
        return
      }

      // Crear el reporte
      const newReport = new Report({
        commentId: rating._id,
        ratingComment: rating.comment,
        ratingDate: rating.createdAt,
        teacherId: rating.professor,
        subject: rating.subject,
        reasons,
        reportComment,
        status: 'pending',
        reportDate: new Date()
      });

      console.log(newReport)

      await newReport.save();

      res.status(201).json(newReport);
    } catch (error) {
      console.error('Error al crear el reporte:', error);
      res.status(500).json({ message: 'Error al crear el reporte' });
    }
  }

  static getAllReports = async (req: Request, res: Response) => {
    try {
      const reports = await Report.find()
        .populate('commentId')
        .populate('teacherId', 'name biography department')
        .populate('subject', 'name credits')  // Esto debería poblar el campo subject
        .exec();

      console.log('Reportes obtenidos:', reports); // Log para debug
      res.status(200).json(reports);
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
      res.status(500).json({ message: 'Error al obtener los reportes' });
    }
  };

  static getReportById = async (req: Request, res: Response) => {
    try {
      const report = await Report.findById(req.params.id)
        .populate('commentId', 'general comment createdAt')
        .populate('teacherId', 'name biography department')
        .populate('subject', 'name credits') // Populate subject
        .exec();

      if (!report) {
        res.status(404).json({ message: 'Reporte no encontrado' });
        return;
      }

      res.status(200).json(report);
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      res.status(500).json({ message: 'Error al obtener el reporte' });
    }
  };

  static deleteReport = async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;

      if (!reportId) {
        res.status(400).json({ error: 'Se requiere ID del reporte' });
        return;
      }

      // Encontrar el reporte
      const report = await Report.findById(reportId);

      if (!report) {
        res.status(404).json({ error: 'Reporte no encontrado' });
        return;
      }

      // Obtener el ID del comentario y del profesor
      const commentId = report.commentId;
      const professorId = report.teacherId;

      if (!commentId || !professorId) {
        res.status(400).json({ error: 'El reporte no contiene IDs válidos de comentario o profesor' });
        return;
      }

      // Eliminar el comentario (rating)
      await Rating.findByIdAndDelete(commentId);

      // Actualizar el estado del reporte a 'deleted'
      report.status = 'deleted';
      await report.save();

      // Actualizar las estadísticas del profesor
      await this.updateProfessorStats(professorId.toString());

      res.status(200).json({
        message: 'Comentario eliminado correctamente',
        report: report
      });
    } catch (error) {
      console.error('Error al eliminar comentario reportado:', error);
      res.status(500).json({
        error: 'Error al eliminar el comentario reportado',
        details: error.message
      });
    }
  }

  static rejectReport = async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;  // Asegúrate de que aquí sea reportId, no id

      const report = await Report.findByIdAndUpdate(
        reportId,
        { status: 'rejected' },
        { new: true }
      );

      if (!report) {
        res.status(404).json({ message: 'Reporte no encontrado' });
        return;
      }

      res.status(200).json(report);
    } catch (error) {
      console.error('Error al rechazar el reporte:', error);
      res.status(500).json({ message: 'Error al rechazar el reporte' });
    }
  }
}