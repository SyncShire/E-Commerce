
import React from 'react';
import { config } from '@/lib/config';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{config.footer.poweredByText}</span>
            {config.footer.poweredByLogo && (
              <img 
                src={config.footer.poweredByLogo} 
                alt="Powered by Logo" 
                className="h-6 w-auto object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
