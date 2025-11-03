import React, { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';

const Privacy: React.FC = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { facultyId } = useParams<{ facultyId?: string }>();
    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen flex flex-col">
            <header className="bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#202024]">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        to={facultyId ? `/` : "/"}
                        className="text-xl font-bold text-black dark:text-white"
                    >
                        ProfeScore
                    </Link>

                    {/* Menú móvil */}
                    <div className="md:hidden dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
                        <i className="fa-solid fa-bars md:hidden " onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <NavLink
                            to="/faq"
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                            }
                        >Preguntas Frecuentes</NavLink>
                        <NavLink
                            to="/privacy"
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                            }
                        >Términos de Privacidad</NavLink>
                    </nav>
                </div>

                {/* Menú móvil */}
                {showMobileMenu && (
                    <div className="md:hidden bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024] py-2">
                        <nav className="container mx-auto px-4 flex flex-col space-y-3">


                            <NavLink
                                to="/faq"
                                className={({ isActive }) =>
                                    `text-sm ${isActive ? 'text-indigo-600 font-medium dark:text-indigo-400' : 'text-gray-600 dark:text-white'}`
                                }
                            >Preguntas Frecuentes</NavLink>
                            <NavLink
                                to="/privacy"
                                className={({ isActive }) =>
                                    `text-sm ${isActive ? 'text-indigo-600 font-medium dark:text-indigo-400' : 'text-gray-600 dark:text-white'}`
                                }
                            >Términos de Privacidad</NavLink>
                        </nav>
                    </div>
                )}
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Términos de Privacidad</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Última actualización: 28 de marzo de 2025</p>
                    </div>

                    {/* Table of Contents - Desktop */}
                    <div className="hidden lg:block sticky top-4 float-right w-64 ml-8 bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contenido</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#info-recopilada" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">1. Información que recopilamos</a>
                            </li>
                            <li>
                                <a href="#uso-info" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">2. Uso de la información</a>
                            </li>
                            <li>
                                <a href="#compartir-info" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">3. Compartir información con terceros</a>
                            </li>
                            <li>
                                <a href="#seguridad" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">4. Seguridad de los datos</a>
                            </li>
                            <li>
                                <a href="#derechos" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">5. Tus derechos</a>
                            </li>
                            <li>
                                <a href="#cambios" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">6. Cambios en estos términos</a>
                            </li>
                            <li>
                                <a href="#contacto" className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-300">7. Contacto</a>
                            </li>
                        </ul>
                    </div>

                    {/* Privacy Terms Content */}
                    <div className="prose prose-indigo max-w-none">
                        <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <p className="text-gray-700 dark:text-white mb-4">
                                En ProfeScore, nos comprometemos a proteger tu privacidad y a ser transparentes sobre cómo utilizamos la información.
                                Estos términos de privacidad explican qué información recopilamos, cómo la utilizamos y tus derechos respecto a ella.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section id="info-recopilada" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Información que recopilamos</h2>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comentarios y calificaciones:</h3>
                                <p className="text-gray-700 dark:text-white mb-4">
                                    Los comentarios, materias, maestros y calificaciones que publicas son completamente anónimos. No almacenamos datos personales (nombre, correo, matrícula, etc.) que permitan identificarte.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cookies y localstorage:</h3>
                                <p className="text-gray-700 dark:text-white mb-4">
                                    Usamos cookies almacenadas en el localstorage de tu navegador únicamente para:
                                </p>
                                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                                    <li className="mb-2">Evitar que califiques al mismo profesor en la misma materia antes de 6 meses.</li>
                                    <li className="mb-2">Recordar preferencias básicas de visualización (ej. comentarios a los que les haz dado like).</li>
                                </ul>
                                <p className="text-gray-700 dark:text-gray-300 ">
                                    Estas cookies no recopilan información personal ni se comparten con terceros.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section id="uso-info" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Uso de la información</h2>

                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                La información anónima que proporcionas (comentarios, calificaciones, materias y profesores) se utiliza exclusivamente para:
                            </p>

                            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                                <li className="mb-2">Generar un panorama general de la percepción estudiantil sobre los profesores.</li>
                                <li className="mb-2">Ayudar a otros alumnos a tomar decisiones informadas.</li>
                                <li className="mb-2">Mejorar la funcionalidad de la plataforma.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section id="compartir-info" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Compartir información con terceros</h2>

                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                No vendemos ni compartimos tu información anónima con empresas, organizaciones o instituciones (incluyendo la UANL).
                            </p>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Excepción legal:</strong> Solo compartiremos datos si es requerido por una orden judicial o autoridad competente, y siempre dentro del marco legal mexicano.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section id="seguridad" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Seguridad de los datos</h2>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Protección técnica:</h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Usamos medidas de seguridad estándar (HTTPS, firewall) para proteger la integridad de la plataforma.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Limitación de acceso:</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Solo el equipo técnico esencial tiene acceso a los servidores, y nunca revisamos datos vinculados a usuarios individuales.
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section id="derechos" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Tus derechos</h2>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Derecho al anonimato:</h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Al no recopilar datos personales, no podemos vincular comentarios o calificaciones a tu identidad.
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Eliminar cookies:</h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Puedes borrar las cookies de ProfeScore en cualquier momento desde la configuración de tu navegador.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reportar contenido:</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Si encuentras un comentario que infringe nuestras normas (ej. datos personales expuestos), repórtalo usando el botón correspondiente o escríbenos a contacto.profescore@gmail.com.
                                </p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section id="cambios" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Cambios en estos términos</h2>

                            <p className="text-gray-700 dark:text-gray-300">
                                Notificaremos actualizaciones significativas mediante un banner en la plataforma. El uso continuado de ProfeScore implica la aceptación de los nuevos términos.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section id="contacto" className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Contacto</h2>

                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Para preguntas sobre privacidad, escribe a: <a href="mailto:contacto.profescore@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">contacto.profescore@gmail.com</a>.
                            </p>

                            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-info-circle text-indigo-400"></i>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-indigo-700">
                                            Última actualización: 28 de marzo de 2025
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Print Button */}
                        <div className="flex justify-end mb-8">
                            <button onClick={() => window.print()} className="flex items-center px-4 py-2 border border-gray-300 dark:border-[#202024] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-[#383939] hover:bg-gray-50 dark:hover:bg-[#ffffff0d] hover:cursor-pointer">
                                <i className="fas fa-print mr-2"></i> Imprimir términos
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024]">
                <div className='container mx-auto text-sm text-center md:text-base md:text-left dark:text-white px-4 py-3 flex items-center justify-between'>
                    <p>&copy; ProfeScore - {new Date().getFullYear()}</p>

                    <div className="flex md:gap-4">
                        <Link to="/faq" className="link">Preguntas Frecuentes</Link>
                        <Link to="/privacy" className="link">Términos de Privacidad</Link>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default Privacy;