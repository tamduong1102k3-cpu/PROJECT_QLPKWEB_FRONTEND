import React, { useState, useEffect, useCallback } from 'react';


const TheThongKe = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-2xl font-black text-gray-800">{value}</h3>
    </div>
  </div>
);

export default TheThongKe;

