import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';

interface RatingForm {
  general: number;
  explanation: number;
  accessibility: number;
  difficulty: number;
  attendance: number;
  wouldRetake: boolean;
  comment: string;
  subject: string;
}

interface Subject {
  _id: string;
  name: string;
}

const ProfessorRating = () => {
  const { facultyId, professorId } = useParams<{ facultyId: string; professorId: string }>();
  const [subjects, setSubjects] = useState<Array<{ _id: string, name: string }>>([]);
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<{ name: string } | null>(null);
  const [formData, setFormData] = useState<RatingForm>({
    general: 3,
    explanation: 3,
    accessibility: 3,
    difficulty: 3,
    attendance: 3,
    wouldRetake: true,
    comment: '',
    subject: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [notification] = useState(false); // Estado para la notificación

  const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

  if (!SITE_KEY) {
    console.error('La clave del sitio de reCAPTCHA no está configurada.');
  }

  console.log('Clave del sitio de reCAPTCHA:', SITE_KEY);

  useEffect(() => {
    if (facultyId) {
      api.get(`/faculties/${facultyId}/subjects`)
        .then(response => {
          // Ordenar las materias alfabéticamente antes de establecerlas en el estado
          const sortedSubjects = response.data.sort((a: Subject, b: Subject) => a.name.localeCompare(b.name));
          setSubjects(sortedSubjects);
        })
        .catch(err => {
          console.error('Error al cargar las materias:', err);
        });
    }
  }, [facultyId]);

  useEffect(() => {
    api.get(`/faculties/${facultyId}/professors/${professorId}`)
      .then(response => setProfessor(response.data))
      .catch(() => setError('No se pudo cargar la información del profesor'));
  }, [facultyId, professorId]);

  const handleRatingChange = (field: keyof RatingForm, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, subject: e.target.value }));
  };

  const handleWouldRetakeChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, wouldRetake: value }));
  };

  const handleCaptchaChange = (value: string | null) => {
    if (value) {
      setCaptchaValue(value);
      setCaptchaError('');
    } else {
      setCaptchaValue('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject) {
      setError('Por favor selecciona una materia');
      return;
    }

    if (!captchaValue) {
      setCaptchaError('Por favor completa el CAPTCHA');
      return;
    }

    // Validación del comentario
    if (!formData.comment.trim()) {
      setError('Por favor proporciona un comentario válido');
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        ...formData,
        professor: professorId,
        captcha: captchaValue
      };

      console.log('Datos a enviar:', ratingData);

      const response = await api.post(`/faculties/${facultyId}/professors/${professorId}/ratings`, ratingData);
      console.log(response);

      if (response.status === 201) {
        // Redirigir a la página del profesor con mensaje de éxito
        navigate(`/facultad/${facultyId}/maestro/${professorId}?ratingSuccess=true`);
      }
    } catch (error) {
      console.log(error);
      setError('Error al enviar la calificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, comment: value }));

    // Validación en tiempo real
    if (!value.trim()) {
      setError('Por favor proporciona un comentario válido');
    } else {
      setError('');
    }
  };

      // En ambos componentes, añadir este useEffect
      useEffect(() => {
        document.title = `ProfeScore - Calificación`;

        const mainElement = document.getElementById('main-content');
        if (mainElement) {
            mainElement.style.viewTransitionName = 'main-content';
            mainElement.style.contain = 'layout';
        }

        return () => {
            const mainElement = document.getElementById('main-content');
            if (mainElement) {
                mainElement.style.viewTransitionName = '';
                mainElement.style.contain = '';
            }
        };
    }, []);

  const renderRatingButtons = (field: keyof RatingForm) => {
    return [1, 2, 3, 4, 5].map(value => (
      <div key={`${field}-${value}`} className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => handleRatingChange(field, value)}
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${formData[field] === value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#383939] dark:text-[#979797] dark:hover:bg-gray-600'
            }`}
        >
          {value}
        </button>
        {(value === 1 && field === 'general') && <span className="text-xs mt-1 dark:text-white">Malo</span>}
        {(value === 5 && field === 'general') && <span className="text-xs mt-1 dark:text-white">Excelente</span>}
      </div>
    ));
  };

  return (
    <>
      <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl dark:text-white font-bold mb-6">Calificar a {professor?.name}</h1>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 space-y-6">
            {notification && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
                Calificación enviada correctamente
              </div>
            )}
            <div className="space-y-2 dark:text-white">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Calificación General</label>
              <div className="flex space-x-2">
                {renderRatingButtons('general')}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-white">Materia</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleSubjectChange}
                className="w-full px-3 py-2 dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>Selecciona una materia</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Explicación</label>
              <div className="flex space-x-2">
                {renderRatingButtons('explanation')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Accesibilidad</label>
              <div className="flex space-x-2">
                {renderRatingButtons('accessibility')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Dificultad</label>
              <div className="flex space-x-2">
                {renderRatingButtons('difficulty')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Asistencia</label>
              <div className="flex space-x-2">
                {renderRatingButtons('attendance')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">¿Tomarías clase con este profesor nuevamente?</label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="wouldTakeAgain-yes"
                    name="wouldTakeAgain"
                    type="radio"
                    checked={formData.wouldRetake === true}
                    onChange={() => handleWouldRetakeChange(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="wouldTakeAgain-yes" className="ml-2 block text-sm text-gray-700 dark:text-white">Sí</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="wouldTakeAgain-no"
                    name="wouldTakeAgain"
                    type="radio"
                    checked={formData.wouldRetake === false}
                    onChange={() => handleWouldRetakeChange(false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="wouldTakeAgain-no" className="ml-2 block text-sm text-gray-700 dark:text-white">No</label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-white">Comentario</label>
              <textarea
                required
                id="comment"
                name="comment"
                placeholder="Comparte tu experiencia con este profesor..."
                rows={5}
                className="w-full px-3 py-2 dark:text-white dark:bg-[#383939] border-2 border-gray-300 dark:border-[#202024] rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.comment}
                onChange={handleCommentChange}
              ></textarea>
              {error && <p className="text-red-600 text-center">{error}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">Verificación CAPTCHA</label>
              <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={handleCaptchaChange}
              />
              {captchaError && <p className="text-red-600 text-sm mt-1">{captchaError}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default ProfessorRating;