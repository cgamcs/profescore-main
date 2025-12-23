import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import Faculty from '../models/Faculty';
import Subject from '../models/Subject';
import Professor from '../models/Professor';
import Rating from '../models/Rating';

export class DashboardController {
    static getRecentActivities = async (req: Request, res: Response) => {
        try {
            // 1. Traemos las actividades y "populamos" la entidad relacionada en UN SOLO paso.
            // Mongoose ya sabe qué modelo buscar gracias a 'onModel' en tu esquema ActivityLog.
            const recentActivities = await ActivityLog.find()
                .sort({ timestamp: -1 })
                .limit(10)
                .populate('relatedEntity', 'name'); // Solo traemos el campo 'name' para ser más ligeros

            // 2. Procesamiento en memoria (CPU) en lugar de Base de Datos (I/O)
            const formattedActivities = recentActivities.map((activity) => {
                // Al usar populate, relatedEntity ya es el objeto, no un ID.
                // Usamos 'any' temporalmente para acceder a .name sin conflictos de tipos estrictos
                const entity: any = activity.relatedEntity;
                const entityName = entity ? entity.name : 'Entidad eliminada';

                // Mapeo de textos
                const activityTypeMap: Record<string, string> = {
                    'CREATE_FACULTY': `Facultad agregada: ${entityName}`,
                    'UPDATE_FACULTY': `Facultad actualizada: ${entityName}`,
                    'DELETE_FACULTY': `Facultad eliminada: ${entityName}`,
                    'CREATE_SUBJECT': `Materia agregada: ${entityName}`,
                    'UPDATE_SUBJECT': `Materia actualizada: ${entityName}`,
                    'DELETE_SUBJECT': `Materia eliminada: ${entityName}`,
                    'CREATE_PROFESSOR': `Nuevo profesor agregado: ${entityName}`,
                    'UPDATE_PROFESSOR': `Profesor actualizado: ${entityName}`,
                    'DELETE_PROFESSOR': `Profesor eliminado: ${entityName}`
                };

                return {
                    type: activityTypeMap[activity.type] || activity.type,
                    details: activity.changes || 'Sin detalles adicionales',
                    timestamp: activity.timestamp
                };
            });

            res.json(formattedActivities);
        } catch (error: any) {
            console.error('Error fetching recent activities:', error);
            res.status(500).json({
                message: 'Error al obtener actividades recientes',
                error: error.message
            });
        }
    };

    static getDashboardStats = async (req: Request, res: Response) => {
        try {
            // OPTIMIZACIÓN CRÍTICA: Ejecución en Paralelo
            // En lugar de esperar a que termine uno para empezar el otro,
            // lanzamos los 4 conteos simultáneamente.
            const [facultiesCount, subjectsCount, professorsCount, ratingsCount] = await Promise.all([
                Faculty.estimatedDocumentCount(), // estimatedDocumentCount es instantáneo (usa metadatos), countDocuments escanea.
                Subject.countDocuments(),         // Usamos countDocuments aquí por si necesitas filtros futuros
                Professor.countDocuments(),
                Rating.countDocuments()
            ]);

            res.json({
                facultiesCount,
                subjectsCount,
                professorsCount,
                ratingsCount
            });
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    };
}