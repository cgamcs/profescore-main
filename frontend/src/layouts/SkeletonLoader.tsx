
const FacultyListLoader = () => {
    return (
        <section className="pb-12 bg-white dark:bg-[#0A0A0A]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="bg-gray-200 dark:bg-[#383939] h-8 w-1/2 mx-auto rounded-lg animate-pulse mb-2"></div>
                    <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/3 mx-auto rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-200 dark:bg-[#202024] border border-gray-200 dark:border-[#202024] rounded-lg p-4 h-25 text-center animate-pulse"></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TopProfessorsLoader = () => {
    return (
        <section className="py-12 bg-gray-50 dark:bg-[#0A0A0A]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="h-6 bg-gray-200 dark:bg-[#383939] rounded-md w-3/4 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#383939] rounded-md w-2/4 mx-auto animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-[#202024] rounded-lg shadow-sm border border-gray-200 dark:border-[#202024] p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="h-6 bg-gray-200 dark:bg-[#383939] rounded-md w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-[#383939] rounded-md w-1/4"></div>
                                </div>
                                <div className="h-6 bg-gray-200 dark:bg-[#383939] rounded-md w-12"></div>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-[#383939] rounded-md w-full mb-4"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-4 bg-gray-200 dark:bg-[#383939] rounded-md w-4 mx-1"></div>
                                    ))}
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-[#383939] rounded-md w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FacultyDetailLoader = () => {
    return (
        <main className="container mx-auto px-4 py-6 dark:bg-[#0A0A0A]">
            <div className="text-2xl font-bold text-black text-center mb-6 animate-pulse">
                <div className="bg-gray-200 dark:bg-[#383939] h-8 w-1/4 mx-auto rounded"></div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <div className="bg-gray-200 dark:bg-[#383939] h-12 w-full rounded-xl animate-pulse"></div>
            </div>

            {/* Sección de Materias */}
            <section className="mb-12">
                <div className="text-xl font-semibold mb-4 animate-pulse">
                    <div className="bg-gray-200 dark:bg-[#383939] h-6 w-1/2 rounded"></div>
                </div>
                <div className="overflow-x-auto rounded-lg dark:bg-[#383939] border border-gray-200 dark:border-[#202024]  shadow-sm">
                    <div className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                        <div className="bg-gray-50 dark:bg-[#202024]">
                            <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex justify-between">
                                <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                                <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                                <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d] flex justify-between">
                                    <div className="px-6 py-4 whitespace-nowrap w-1/3 text-sm font-medium text-indigo-600">
                                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                                    </div>
                                    <div className="pl-15 py-4 whitespace-nowrap w-1/3 text-sm text-gray-500">
                                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                                    </div>
                                    <div className="pl-23 py-4 whitespace-nowrap w-1/3 text-sm text-gray-500">
                                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/4 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Profesores Destacados */}
            <section>
                <div className="text-xl font-semibold mb-4 animate-pulse">
                    <div className="bg-gray-200 dark:bg-[#383939] h-6 w-1/2 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 animate-pulse">
                            <div className="font-medium text-lg mb-1">
                                <div className="bg-gray-200 dark:bg-[#383939] h-6 w-3/4 rounded"></div>
                            </div>
                            <div className="text-gray-500 text-sm mb-3">
                                <div className="bg-gray-200 dark:bg-[#383939] h-4 w-1/2 rounded"></div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 dark:bg-[#383939] h-6 w-16 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

const SubjectPageLoader = () => {
    return (
        <main className="container mx-auto px-4 py-6 dark:bg-[#0A0A0A]">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-gray-200 dark:bg-[#383939] h-8 w-32 rounded-md animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-[#383939] h-10 w-32 rounded-md animate-pulse"></div>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <div className="bg-gray-200 dark:bg-[#383939] h-12 w-full rounded-xl animate-pulse"></div>
            </div>

            {/* Lista de materias y profesores */}
            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-[#383939]">
                    {[...Array(5)].map((_, i) => (
                        <li key={i}>
                            <div className="block hover:bg-gray-50 dark:hover:bg-[#ffffff0d] p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-40 rounded-md animate-pulse"></div>
                                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-24 rounded-md animate-pulse mt-2"></div>
                                    </div>
                                    <div className="bg-gray-200 dark:bg-[#383939] h-4 w-16 rounded-md animate-pulse"></div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
};

const SubjectDetailLoader = () => {
    return (
        <div className="container mx-auto px-4 py-6 dark:bg-[#0A0A0A]">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-gray-200 dark:bg-[#383939] h-8 w-1/2 rounded-lg animate-pulse"></div>
            </div>

            {/* Subject Info Skeleton */}
            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-24 rounded-lg mb-2 animate-pulse"></div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-32 rounded-lg animate-pulse"></div>
                    </div>
                    <div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-24 rounded-lg mb-2 animate-pulse"></div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-32 rounded-lg animate-pulse"></div>
                    </div>
                    <div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-4 w-24 rounded-lg mb-2 animate-pulse"></div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-32 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div>
                    <div className="bg-gray-200 dark:bg-[#383939] h-4 w-24 rounded-lg mb-2 animate-pulse"></div>
                    <div className="bg-gray-200 dark:bg-[#383939] h-16 w-full rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* Teachers List Skeleton */}
            <div className="bg-gray-200 dark:bg-[#383939] h-8 w-1/2 rounded-lg mb-4 animate-pulse"></div>
            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <div className="bg-gray-200 dark:bg-[#383939] h-10 w-full rounded-lg animate-pulse mb-2"></div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 dark:bg-[#383939] h-16 w-full rounded-lg animate-pulse mb-2"></div>
                ))}
            </div>
        </div>
    );
};

const ProfessorPageLoader = () => {
    return (
        <main className="container mx-auto px-4 py-6 dark:bg-[#0A0A0A]">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-gray-200 dark:bg-[#383939] h-8 w-32 rounded-md animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-[#383939] h-10 w-32 rounded-md animate-pulse"></div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <div className="bg-gray-200 dark:bg-[#383939] h-12 w-full rounded-xl animate-pulse"></div>
            </div>

            {/* Professors Table */}
            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-200 dark:bg-[#383939] h-12 w-full animate-pulse"></div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                    <thead className="bg-gray-50 dark:bg-[#202024]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materias</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Calificación</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="bg-gray-200 dark:bg-[#383939] h-6 w-40 rounded-md animate-pulse"></div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1">
                                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-20 rounded-md animate-pulse"></div>
                                        <div className="bg-gray-200 dark:bg-[#383939] h-6 w-20 rounded-md animate-pulse"></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="bg-gray-200  dark:bg-[#383939] h-6 w-12 rounded-md animate-pulse"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

const ProfessorDetailLoader = () => {
    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna izquierda */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-200 dark:bg-[#383939] h-40 rounded-lg shadow-md mb-6 animate-pulse"></div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-64 rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm mb-6 animate-pulse"></div>
                        <div className="bg-gray-200 dark:bg-[#383939] h-40 rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm animate-pulse"></div>
                        <div className="mt-6">
                            <div className="bg-gray-200 dark:bg-[#383939] h-10 rounded-md animate-pulse"></div>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="md:col-span-2">
                        <div>
                            <div className="bg-gray-200 dark:bg-[#383939] h-8 rounded-lg mb-4 animate-pulse"></div>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-gray-200 dark:bg-[#383939] h-32 rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export { 
    FacultyListLoader,
    TopProfessorsLoader,
    FacultyDetailLoader,
    SubjectPageLoader,
    SubjectDetailLoader,
    ProfessorPageLoader,
    ProfessorDetailLoader
}