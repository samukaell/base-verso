import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({ 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-900/80 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.2)] w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-red-900/50 bg-red-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="font-bold text-lg text-slate-100 leading-tight">{title}</h2>
              <span className="text-xs text-red-400">Ação Irreversível</span>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            disabled={isDeleting}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? 'Destruindo...' : 'Confirmar Destruição'}
          </button>
        </div>
      </div>
    </div>
  );
}
