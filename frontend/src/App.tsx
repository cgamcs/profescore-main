import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import LayoutWithHeader from './layouts/UserWithHeader';
import FacultyDetails from './pages/FacultyDetail';
import SubjectsPage from './pages/SubjectsPage';
import ProfessorsPage from './pages/Professors';
import SubjectDetail from './pages/SubjectDetail';
import ProfessorDetail from './pages/ProfessorDetail';
import ProfessorRating from './pages/ProfessorRating';
import ProfessorAdd from './components/ProfessorAdd';
import AdminLogin from './pages/admin/Login';
import AdminWithHeader from './layouts/AdminWithHeader';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFaculties from './pages/admin/Faculties';
import AdminSubjects from './pages/admin/Subjects';
import AdminProfessors from './pages/admin/Professors';
import Unauthorized from './components/401/Unauthorized';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import AdminReports from './pages/admin/Reports';
import HomePage from './layouts/HomePage'; // Importa el nuevo componente

const themeKeys = {
  system: "system",
  light: "light",
  dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

// Function to check if browser supports View Transitions API
const supportsViewTransitions = () => {
  return !!document.startViewTransition;
};

const App: React.FC = () => {
  const [theme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');

  // Add a class to the body if the browser supports View Transitions
  if (supportsViewTransitions()) {
    document.body.classList.add('view-transitions-enabled');
  }

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyThem = () => {
      root.classList.toggle(
        'dark',
        theme === themeKeys.dark ||
        (theme === themeKeys.system && mediaQuery.matches)
      )

      localStorage.setItem("theme", theme)
    };

    applyThem();

    mediaQuery.addEventListener("change", applyThem)

    return () => {
      mediaQuery.removeEventListener("change", applyThem)
    };
  }, [theme]);

  return (
    <>
      <Routes>
        {/* Ruta de login para admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminWithHeader />}>
          <Route index element={<AdminDashboard />} />
          <Route path="facultades" element={<AdminFaculties />} />
          <Route path="materias" element={<AdminSubjects />} />
          <Route path="profesores" element={<AdminProfessors />} />
          <Route path="reportes" element={<AdminReports />} />
        </Route>

        {/* Ruta principal sin header */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas con header */}
        <Route path="/facultad/:facultyId" element={<LayoutWithHeader />}>
          <Route index element={<FacultyDetails />} />
          <Route path="materias" element={<SubjectsPage />} />
          <Route path="materia/:subjectId" element={<SubjectDetail />} />
          <Route path="maestros" element={<ProfessorsPage />} />
          <Route path="maestros/agregar-maestro" element={<ProfessorAdd />} />
          <Route path="maestro/:professorId" element={<ProfessorDetail />} />
          <Route path="maestro/:professorId/calificar" element={<ProfessorRating />} />
        </Route>

        <Route path='/faq' element={<Faq />}></Route>
        <Route path='/privacy' element={<Privacy />}></Route>

        <Route element={<LayoutWithHeader />}>
          <Route path='/401' element={<Unauthorized />}></Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

export default App;