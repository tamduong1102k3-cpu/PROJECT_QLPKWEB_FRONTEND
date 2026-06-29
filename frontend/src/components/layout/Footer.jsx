import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full gap-4 max-w-screen-2xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-sm font-manrope text-slate-500 dark:text-slate-400">© 2024 MedCore Healthcare Systems. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-sm font-manrope text-slate-500 dark:text-slate-400 cursor-pointer transition-opacity hover:text-blue-700 dark:hover:text-blue-300" href="#">Privacy Policy</a>
          <a className="text-sm font-manrope text-slate-500 dark:text-slate-400 cursor-pointer transition-opacity hover:text-blue-700 dark:hover:text-blue-300" href="#">Terms of Service</a>
          <a className="text-sm font-manrope text-slate-500 dark:text-slate-400 cursor-pointer transition-opacity hover:text-blue-700 dark:hover:text-blue-300" href="#">HIPAA Compliance</a>
          <a className="text-sm font-manrope text-slate-500 dark:text-slate-400 cursor-pointer transition-opacity hover:text-blue-700 dark:hover:text-blue-300" href="#">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-400 hover:text-blue-600 cursor-pointer">social_leaderboard</span>
          <span className="material-symbols-outlined text-slate-400 hover:text-blue-600 cursor-pointer">potted_plant</span>
          <span className="material-symbols-outlined text-slate-400 hover:text-blue-600 cursor-pointer">rss_feed</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
