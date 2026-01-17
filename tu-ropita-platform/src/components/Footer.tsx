import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-background text-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-6">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/terms"
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-details transition-colors"
          >
            <span>Términos y Condiciones</span>
          </Link>

          <Link
            href="/privacy"
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-details transition-colors"
          >
            <span>Política de Privacidad</span>
          </Link>
        </div>

        {/* Contacto */}
        <div className="text-sm text-foreground/60">
          <span>Contacto: </span>
          <a
            href="mailto:contactofindclo@gmail.com"
            className="hover:text-details transition-colors"
          >
            contactofindclo@gmail.com
          </a>
        </div>

        <p className="text-xs text-foreground/40 text-center">
          FindClo © {new Date().getFullYear()} — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
};

export default Footer;
