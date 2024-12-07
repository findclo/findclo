const Footer = () => {
    return (
      <footer className="bg-background text-foreground p-8 mt-auto hidden md:block">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/40">Todos los derechos reservados.</p>
            <p className="text-sm text-foreground/40">FindClo &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;