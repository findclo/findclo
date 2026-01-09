import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones - FindClo",
  description: "Términos y condiciones de uso del servicio FindClo",
};

export default function TerminosPage() {
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
            Términos y Condiciones de Uso
          </CardTitle>
          <p className="text-sm text-foreground/60">
            Última actualización: {lastUpdated}
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="mt-6 space-y-8">
          {/* Sección 1: Aceptación de Términos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              1. Aceptación de Términos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Bienvenido a FindClo. Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones de Uso y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, le prohibimos usar o acceder a este sitio.
              </p>
              <p>
                El uso de este sitio web está disponible únicamente para personas mayores de 18 años. Al utilizar este sitio, usted declara y garantiza que tiene al menos 18 años de edad.
              </p>
            </div>
          </section>

          {/* Sección 2: Descripción del Servicio */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              2. Descripción del Servicio
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                FindClo es una plataforma de descubrimiento de indumentaria que conecta a usuarios con diversas marcas de ropa. Actuamos como intermediario entre los usuarios y las marcas, facilitando el acceso a información sobre productos, pero no somos los vendedores directos de los productos mostrados en nuestra plataforma.
              </p>
              <p>
                Cada marca es responsable de sus propios productos, precios, disponibilidad, políticas de envío y devoluciones. FindClo no asume responsabilidad por las transacciones realizadas directamente entre usuarios y marcas.
              </p>
            </div>
          </section>

          {/* Sección 3: Cuentas de Usuario */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              3. Cuentas de Usuario
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Las cuentas de usuario en FindClo están disponibles principalmente para propietarios de marcas que desean listar sus productos en nuestra plataforma. Si crea una cuenta, usted es responsable de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mantener la confidencialidad de su contraseña y cuenta</li>
                <li>Proporcionar información veraz, precisa y actualizada</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos o que participen en actividades fraudulentas o ilegales.
              </p>
            </div>
          </section>

          {/* Sección 4: Productos y Precios */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              4. Productos y Precios
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                La información sobre productos, incluyendo descripciones, imágenes y precios, es proporcionada directamente por las marcas asociadas. Si bien hacemos nuestro mejor esfuerzo para asegurar que la información sea precisa, no garantizamos la exactitud, integridad o actualidad de dicha información.
              </p>
              <p>
                Los precios están sujetos a cambios sin previo aviso. Las marcas individuales son responsables de establecer y mantener sus propios precios. La disponibilidad de productos no está garantizada y puede variar según el stock de cada marca.
              </p>
              <p>
                Cualquier error tipográfico, fotográfico o de otro tipo en la información de productos no es vinculante. Nos reservamos el derecho de corregir cualquier error sin obligación de honrar precios o información incorrecta.
              </p>
            </div>
          </section>

          {/* Sección 5: Compras y Pagos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              5. Compras y Pagos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Las compras de productos se realizan directamente con las marcas asociadas, no a través de FindClo. Cuando hace clic en un producto o marca para realizar una compra, será redirigido al sitio web o canal de venta de la marca correspondiente.
              </p>
              <p>
                FindClo no procesa pagos ni maneja información de pago de los usuarios. Cada marca tiene sus propias políticas de pago, métodos aceptados y condiciones de venta. Le recomendamos revisar cuidadosamente las políticas de cada marca antes de realizar una compra.
              </p>
              <p>
                Cualquier disputa relacionada con pagos, cargos o transacciones debe resolverse directamente con la marca correspondiente.
              </p>
            </div>
          </section>

          {/* Sección 6: Devoluciones y Reembolsos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              6. Devoluciones y Reembolsos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Las políticas de devolución, cambio y reembolso son específicas de cada marca y están fuera del control de FindClo. No manejamos devoluciones ni procesamos reembolsos.
              </p>
              <p>
                Para solicitar una devolución o reembolso, debe contactar directamente a la marca de la cual realizó la compra. Cada marca establecerá sus propios plazos, condiciones y procedimientos para devoluciones.
              </p>
              <p>
                FindClo actúa únicamente como plataforma de descubrimiento y no asume ninguna responsabilidad respecto a las políticas de devolución de las marcas asociadas.
              </p>
            </div>
          </section>

          {/* Sección 7: Propiedad Intelectual */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              7. Propiedad Intelectual
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Todo el contenido de FindClo, incluyendo pero no limitado a texto, gráficos, logos, iconos, imágenes, clips de audio, descargas digitales y software, es propiedad de FindClo o de sus proveedores de contenido y está protegido por las leyes de derechos de autor internacionales.
              </p>
              <p>
                Las marcas comerciales, logos y marcas de servicio (colectivamente, las &quot;Marcas&quot;) mostradas en el sitio son propiedad registrada y no registrada de FindClo y de terceros. No se otorga ninguna licencia o derecho de uso de estas Marcas sin el consentimiento previo por escrito de FindClo o del tercero propietario.
              </p>
              <p>
                Las imágenes y descripciones de productos son propiedad de las marcas respectivas. El uso no autorizado de cualquier contenido puede violar las leyes de derechos de autor, marcas comerciales y otras leyes aplicables.
              </p>
            </div>
          </section>

          {/* Sección 8: Conducta Prohibida */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              8. Conducta Prohibida
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Al utilizar FindClo, usted acepta no:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usar el sitio para fines comerciales no autorizados</li>
                <li>Realizar scraping, minería de datos o recopilación automática de contenido</li>
                <li>Intentar obtener acceso no autorizado a cualquier parte del sitio o sistemas relacionados</li>
                <li>Interferir con el funcionamiento correcto del sitio</li>
                <li>Cargar virus, malware o código malicioso</li>
                <li>Hacerse pasar por otra persona o entidad</li>
                <li>Publicar contenido ofensivo, difamatorio, obsceno o ilegal</li>
                <li>Violar los derechos de propiedad intelectual de terceros</li>
                <li>Participar en actividades fraudulentas o engañosas</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o terminar su acceso al sitio si viola cualquiera de estas restricciones.
              </p>
            </div>
          </section>

          {/* Sección 9: Limitación de Responsabilidad */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              9. Limitación de Responsabilidad
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                FindClo proporciona este sitio web y todos los contenidos &quot;tal cual&quot; y &quot;según disponibilidad&quot;, sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>El sitio estará disponible ininterrumpidamente o libre de errores</li>
               <li>La información proporcionada por las marcas sea precisa o confiable</li>
              </ul>
              <p>
                En ningún caso FindClo será responsable por daños directos, indirectos, incidentales, especiales, consecuentes o punitivos que resulten del uso o la imposibilidad de usar el sitio, incluso si hemos sido advertidos de la posibilidad de tales daños.
              </p>
              <p>
                Como plataforma intermediaria, no somos responsables de la calidad, seguridad o legalidad de los productos anunciados por las marcas, ni de la capacidad de las marcas para completar transacciones.
              </p>
            </div>
          </section>

          {/* Sección 10: Modificaciones de los Términos */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              10. Modificaciones de los Términos
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
              <p>
                Es su responsabilidad revisar periódicamente estos términos para estar al tanto de cualquier cambio. El uso continuado del sitio después de la publicación de cambios constituye su aceptación de dichos cambios.
              </p>
              <p>
                Si no está de acuerdo con los términos modificados, debe dejar de usar el sitio inmediatamente.
              </p>
            </div>
          </section>

          {/* Sección 11: Contacto */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-details mb-4">
              11. Información de Contacto
            </h2>
            <div className="space-y-3 text-foreground/80 text-sm md:text-base">
              <p>
                Si tiene preguntas, comentarios o inquietudes sobre estos Términos y Condiciones, puede contactarnos a través de:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <p className="font-medium text-foreground">
                  Email: <a href="mailto:contacto@findclo.com" className="text-details hover:underline">contacto@findclo.com</a>
                </p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
