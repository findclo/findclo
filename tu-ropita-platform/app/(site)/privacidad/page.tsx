import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad - FindClo",
  description: "Política de privacidad y protección de datos de FindClo",
};

export default function PrivacidadPage() {
  const lastUpdated = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
            Política de Privacidad
          </CardTitle>
          <p className="text-sm text-foreground/60">
            Última actualización: {lastUpdated}
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="mt-6 space-y-8">
          {/* Sección 1: Introducción */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              1. Introducción
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                En FindClo, nos comprometemos a proteger su privacidad y los datos personales que comparte con nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información cuando utiliza nuestro sitio web.
              </p>
              <p>
                Al utilizar FindClo, usted acepta las prácticas descritas en esta Política de Privacidad. Si no está de acuerdo con esta política, le solicitamos que no utilice nuestro sitio web.
              </p>
              <p>
                FindClo actúa como responsable del tratamiento de los datos personales recopilados a través de este sitio web.
              </p>
            </div>
          </section>

          {/* Sección 2: Información que Recopilamos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              2. Información que Recopilamos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:
              </p>

              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Información de Cuenta</h3>
                  <p>
                    Para propietarios de marcas que crean cuentas: nombre, dirección de correo electrónico, contraseña (encriptada), información de la marca, datos de contacto.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Información de Uso</h3>
                  <p>
                    Páginas visitadas, productos vistos, tiempo en el sitio, patrones de navegación, términos de búsqueda, interacciones con productos y marcas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Información Técnica</h3>
                  <p>
                    Dirección IP, tipo y versión de navegador, configuración de zona horaria, sistema operativo y plataforma, identificadores de dispositivo.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Información Voluntaria</h3>
                  <p>
                    Cualquier información que nos proporcione voluntariamente a través de formularios de contacto, feedback o comunicaciones con nosotros.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: Cómo Usamos tu Información */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              3. Cómo Usamos tu Información
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Utilizamos la información recopilada para los siguientes propósitos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar, operar y mantener nuestro sitio web y servicios</li>
                <li>Mejorar, personalizar y expandir nuestros servicios</li>
                <li>Comprender y analizar cómo utiliza nuestro sitio</li>
                <li>Desarrollar nuevos productos, servicios y funcionalidades</li>
                <li>Comunicarnos con usted para actualizaciones, notificaciones y soporte</li>
                <li>Enviar información relacionada con el servicio y actualizaciones importantes</li>
                <li>Detectar, prevenir y abordar problemas técnicos y de seguridad</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Analizar tendencias y generar estadísticas agregadas (anonimizadas)</li>
                <li>Facilitar la conexión entre usuarios y marcas asociadas</li>
              </ul>
            </div>
          </section>

          {/* Sección 4: Compartir Información */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              4. Compartir tu Información
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Podemos compartir su información en las siguientes circunstancias:
              </p>

              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Con Marcas Asociadas</h3>
                  <p>
                    Cuando interactúa con productos o marcas específicas, cierta información puede compartirse con esas marcas para facilitar la conexión y potenciales transacciones.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Proveedores de Servicios</h3>
                  <p>
                    Compartimos información con proveedores de servicios externos que nos ayudan a operar nuestro sitio (hosting, análisis, almacenamiento, etc.), bajo obligaciones de confidencialidad.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Requisitos Legales</h3>
                  <p>
                    Cuando sea necesario para cumplir con leyes aplicables, regulaciones, procesos legales o solicitudes gubernamentales.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Transferencias de Negocio</h3>
                  <p>
                    En caso de fusión, adquisición, venta de activos u otra transacción comercial, su información puede transferirse como parte del negocio.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Con su Consentimiento</h3>
                  <p>
                    Compartiremos su información cuando haya dado su consentimiento explícito para hacerlo.
                  </p>
                </div>
              </div>

              <p className="mt-4">
                No vendemos, alquilamos ni comercializamos su información personal a terceros para fines de marketing.
              </p>
            </div>
          </section>

          {/* Sección 5: Cookies y Tecnologías de Rastreo */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              5. Cookies y Tecnologías de Rastreo
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Utilizamos cookies y tecnologías de rastreo similares para mejorar su experiencia en nuestro sitio:
              </p>

              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookies Esenciales</h3>
                  <p>
                    Necesarias para el funcionamiento básico del sitio, como autenticación de sesión y preferencias de usuario.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Rendimiento</h3>
                  <p>
                    Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio, recopilando información de forma anónima.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cookies de Funcionalidad</h3>
                  <p>
                    Permiten recordar sus preferencias y personalizar su experiencia.
                  </p>
                </div>
              </div>

              <p className="mt-4">
                Puede controlar y administrar cookies a través de la configuración de su navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
              </p>
            </div>
          </section>

          {/* Sección 6: Seguridad de Datos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              6. Seguridad de Datos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encriptación de datos sensibles (contraseñas, información de cuenta)</li>
                <li>Conexiones seguras mediante HTTPS/SSL</li>
                <li>Controles de acceso limitados a datos personales</li>
                <li>Monitoreo regular de vulnerabilidades de seguridad</li>
                <li>Auditorías y revisiones de seguridad periódicas</li>
                <li>Protección contra ataques maliciosos y accesos no autorizados</li>
              </ul>
              <p className="mt-4">
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por proteger su información, no podemos garantizar su seguridad absoluta.
              </p>
            </div>
          </section>

          {/* Sección 7: Tus Derechos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              7. Tus Derechos sobre tus Datos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Dependiendo de su ubicación, puede tener los siguientes derechos respecto a su información personal:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Derecho de Acceso:</strong> Solicitar una copia de los datos personales que tenemos sobre usted</li>
                <li><strong>Derecho de Rectificación:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Derecho de Supresión:</strong> Solicitar la eliminación de sus datos personales</li>
                <li><strong>Derecho de Portabilidad:</strong> Recibir sus datos en un formato estructurado y legible</li>
                <li><strong>Derecho de Oposición:</strong> Oponerse al procesamiento de sus datos en ciertas circunstancias</li>
                <li><strong>Derecho de Restricción:</strong> Solicitar la limitación del procesamiento de sus datos</li>
                <li><strong>Derecho a Retirar el Consentimiento:</strong> Cuando el procesamiento se base en su consentimiento</li>
              </ul>
              <p className="mt-4">
                Para ejercer cualquiera de estos derechos, contáctenos a través de: <a href="mailto:privacidad@findclo.com" className="text-details hover:underline">privacidad@findclo.com</a>
              </p>
            </div>
          </section>

          {/* Sección 8: Retención de Datos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              8. Retención de Datos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos para los cuales fue recopilada, incluyendo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mientras mantenga una cuenta activa con nosotros</li>
                <li>Para cumplir con obligaciones legales, contables o de informes</li>
                <li>Para resolver disputas y hacer cumplir nuestros acuerdos</li>
                <li>Para propósitos legítimos de negocio</li>
              </ul>
              <p className="mt-4">
                Cuando su información ya no sea necesaria, la eliminaremos de forma segura o la anonimizaremos para que no pueda ser asociada con usted.
              </p>
            </div>
          </section>

          {/* Sección 9: Cambios a esta Política */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              9. Cambios a esta Política de Privacidad
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Podemos actualizar nuestra Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o por razones operativas, legales o regulatorias.
              </p>
              <p>
                Le notificaremos sobre cualquier cambio material publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización" al inicio del documento.
              </p>
              <p>
                Le recomendamos revisar esta Política de Privacidad periódicamente para estar informado sobre cómo protegemos su información.
              </p>
            </div>
          </section>

          {/* Sección 10: Contacto */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              10. Información de Contacto
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Si tiene preguntas, comentarios o inquietudes sobre esta Política de Privacidad o nuestras prácticas de datos, puede contactarnos a través de:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg mt-4 space-y-2">
                <p className="font-medium text-foreground">
                  Email General: <a href="mailto:contacto@findclo.com" className="text-details hover:underline">contacto@findclo.com</a>
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
