"use client";
import { useRouter } from 'next/navigation';
import { FormEvent } from "react";

function Home() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Importante para incluir cookies
      });

      if (response.ok) {
        // Esperar un momento para que la cookie se establezca
        setTimeout(() => {
          router.push("/application");
        }, 100);
      } else {
        const errorData = await response.json();
        console.error('Error de login:', errorData.message);
        alert('Error de login: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 bg-login">
      {/* Columna del formulario */}
      <div className="flex items-center justify-center p-8 w-96 shadow-lg border bg-stone-50 border-gray-300 rounded-lg">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Iniciar sesión
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Correo electrónico"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="cursor-pointer group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-corporate-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>

      
    </div>
  );
}

export default Home;
