import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/apply", label: "Apply Now" },
    { href: "/calculator", label: "Calculator" },
    { href: "/track-status", label: "Track Status" },
    { href: "#support", label: "Support" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-bold text-lg">M</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg opacity-0 group-hover:opacity-30 blur-lg transition-all duration-300"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                    M-Credit
                  </h1>
                  <span className="text-xs text-gray-500 font-medium -mt-1">Daily Collection</span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text hover:text-primary'
                  }`}>
                    {item.label}
                  </a>
                </Link>
              ))}
              <Link href="/admin">
                <Button className="bg-primary text-white hover:bg-primary-light">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a 
                        className={`block px-3 py-2 text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-primary'
                            : 'text-text hover:text-primary'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    </Link>
                  ))}
                  <Link href="/admin">
                    <Button 
                      className="bg-primary text-white hover:bg-primary-light w-full mt-4"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
