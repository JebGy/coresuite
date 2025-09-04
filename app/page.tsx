import React from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="ml-3">
                <img src="/rg.png" alt="" className="w-32 -ml-2" />

                <p className="text-sm text-gray-600">
                  CoreSuite Management System
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-[#102636] mb-6">
              Gestión Empresarial
              <span className="block text-[#2DB4A5]">Inteligente</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CoreSuite es la solución integral de gestión empresarial que
              optimiza tus procesos, mejora la productividad y potencia el
              crecimiento de Ramirez Group.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="bg-[#2DB4A5] hover:bg-[#25a394] text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg">
                Comenzar Ahora
              </a>
             
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
