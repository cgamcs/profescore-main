import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Building2, MessageSquare } from "lucide-react";
import axios from 'axios';

const themeKeys = {
  system: "system",
  light: "light",
  dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

// Interfaces for our data types
interface DashboardStats {
  facultiesCount: number;
  subjectsCount: number;
  professorsCount: number;
  ratingsCount: number;
}

interface RecentActivity {
  type: string;
  details: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [theme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');

  const [stats, setStats] = useState<DashboardStats>({
    facultiesCount: 0,
    subjectsCount: 0,
    professorsCount: 0,
    ratingsCount: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      root.classList.toggle(
        'dark',
        theme === themeKeys.dark ||
        (theme === themeKeys.system && mediaQuery.matches)
      )

      localStorage.setItem("theme", theme)
    };

    applyTheme();

    mediaQuery.addEventListener("change", applyTheme)

    // Set view transition name for header
    const headerElement = document.getElementById('site-header');
    if (headerElement) {
      headerElement.style.viewTransitionName = 'site-header';
    }

    return () => {
      mediaQuery.removeEventListener("change", applyTheme)
    };
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/401');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Lanzamos ambas peticiones en paralelo al navegador
        const statsPromise = axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const activitiesPromise = axios.get(`${import.meta.env.VITE_API_URL}/admin/recent-activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Esperamos a ambas (o manejamos fallo individual si prefieres Promise.allSettled)
        const [statsResponse, activitiesResponse] = await Promise.all([
          statsPromise,
          activitiesPromise
        ]);

        setStats(statsResponse.data);

        const activities = Array.isArray(activitiesResponse.data)
          ? activitiesResponse.data.slice(0, 5)
          : [];
        setRecentActivities(activities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Opcional: No redirigir si falla una sola cosa, pero por ahora mantenemos tu lógica
        setError(error instanceof Error ? error.message : 'Error desconocido');
        // navigate('/401'); // Comentado: A veces falla la red y no queremos sacar al admin por eso
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Format timestamp to human-readable relative time
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.round((now.getTime() - past.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos momentos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Hace 1 día';
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  // Parse activity to separate title and details
  const parseActivity = (activity: RecentActivity) => {
    // Split the type to separate the generic action from the specific entity
    const parts = activity.type.split(': ');
    return {
      title: parts[0], // "Nueva facultad creada"
      entity: parts[1] || '', // "Facultad de Organización Deportiva"
      details: activity.details,
      timestamp: activity.timestamp
    };
  };

  // Handle loading and error states
  if (loading) return <div className="text-center py-8"><span className="loader"></span></div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="dark:text-white text-2xl font-bold">Panel de Administración</h1>
      <p className="text-gray-500 dark:text-[#d4d3d3] mb-6">Resumen del sistema de calificación de maestros</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/profesores" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#d4d3d3]">Profesores</p>
              <p className="text-2xl dark:text-white font-bold mt-1">{stats.professorsCount}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 text-3xl p-2 rounded-full"><Users /></div>
          </div>
        </Link>

        <Link to="/admin/materias" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#d4d3d3]">Materias</p>
              <p className="text-2xl dark:text-white font-bold mt-1">{stats.subjectsCount}</p>
            </div>
            <div className="bg-purple-100 text-purple-600 text-3xl p-2 rounded-full"><BookOpen /></div>
          </div>
        </Link>

        <Link to="/admin/facultades" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#d4d3d3]">Facultades</p>
              <p className="text-2xl dark:text-white font-bold mt-1">{stats.facultiesCount}</p>
            </div>
            <div className="bg-amber-100 text-amber-600 text-3xl p-2 rounded-full"><Building2 /></div>
          </div>
        </Link>

        <Link to="/admin/resenas" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#d4d3d3]">Comentarios</p>
              <p className="text-2xl dark:text-white font-bold mt-1">{stats.ratingsCount}</p>
            </div>
            <div className="bg-emerald-100 text-emerald-600 text-3xl p-2 rounded-full"><MessageSquare /></div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#202024] rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="font-medium">Actividad Reciente</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#383939]">
          {recentActivities.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-white">
              No hay actividades recientes
            </div>
          ) : (
            recentActivities.map((activity, index) => {
              const parsedActivity = parseActivity(activity);
              return (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="dark:text-white font-bold">{parsedActivity.title}</p>
                      {parsedActivity.entity && (
                        <p className="text-sm text-gray-700 dark:text-[#d4d3d3] mb-1">
                          {parsedActivity.entity}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 ml-4">
                      {formatTimestamp(parsedActivity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;