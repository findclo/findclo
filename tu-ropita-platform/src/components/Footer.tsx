import { Separator } from "@/components/ui/separator";

const Footer = () => {
    return (
      <footer className="bg-background text-foreground p-8 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Tu Ropita. Todos los derechos reservados.</p>
            <Separator className="my-4 md:hidden" />
            <nav className="flex space-x-4">
              <a href="#" className="text-sm hover:underline">Terms</a>
              <a href="#" className="text-sm hover:underline">Privacy</a>
              <a href="#" className="text-sm hover:underline">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;