import Link from 'next/link';
import { FileText, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-background text-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-6">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/terminos"
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-details transition-colors"
          >
            <span>Términos y Condiciones</span>
          </Link>

          <Link
            href="/privacidad"
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-details transition-colors"
          >
            <span>Política de Privacidad</span>
          </Link>
        </div>

        <p className="text-xs text-foreground/40 text-center">
          FindClo © {new Date().getFullYear()} — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
};

export default Footer;
