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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16 md:py-32">
        <div className="flex flex-col items-center justify-center space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CoreSuite
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Sistema integral de gestión empresarial
            </p>
            <p className="text-gray-500 max-w-3xl mx-auto">
              Optimice sus operaciones empresariales con nuestra solución completa de gestión. 
              Diseñado para empresas que buscan eficiencia, control y crecimiento sostenible.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <div className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {feature.title}
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="w-full max-w-4xl space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="/application"
            className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            Acceder al Sistema
          </a>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: CubeIcon,
    title: "Gestión de Inventario",
    description:
      "Control completo de productos, movimientos y valorización en tiempo real.",
    benefits: [
      "Control de stock en tiempo real",
      "Gestión de múltiples almacenes",
      "Reportes detallados de inventario",
    ],
  },
  {
    icon: UserGroupIcon,
    title: "Recursos Humanos",
    description:
      "Administración eficiente del personal y gestión de trabajadores.",
    benefits: [
      "Gestión de personal simplificada",
      "Control de asistencia",
      "Administración de roles",
    ],
  },
  {
    icon: DocumentMagnifyingGlassIcon,
    title: "Trazabilidad Total",
    description: "Seguimiento detallado de operaciones y registros históricos.",
    benefits: [
      "Historial completo de movimientos",
      "Auditoría de cambios",
      "Reportes personalizados",
    ],
  },
];

const stats = [
  {
    value: "+1000",
    label: "Productos Gestionados",
  },
  {
    value: "99.9%",
    label: "Precisión de Inventario",
  },
  {
    value: "24/7",
    label: "Disponibilidad",
  },
];

const faqs = [
  {
    question: "¿Qué tipo de soporte ofrecen?",
    answer: "Brindamos soporte técnico 24/7 a través de múltiples canales, incluyendo chat en vivo, correo electrónico y teléfono.",
  },
  {
    question: "¿Es posible personalizar el sistema?",
    answer: "Sí, el sistema es altamente personalizable y se puede adaptar a las necesidades específicas de su empresa.",
  },
  {
    question: "¿Cómo garantizan la seguridad de los datos?",
    answer: "Utilizamos tecnología de encriptación avanzada y seguimos las mejores prácticas de seguridad de la industria para proteger su información.",
  },
  {
    question: "¿Cuánto tiempo toma la implementación?",
    answer: "El tiempo de implementación varía según las necesidades, pero típicamente toma entre 2-4 semanas para una implementación completa.",
  },
];

export default Page;
