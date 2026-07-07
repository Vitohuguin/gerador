import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeBlockProps {
  message?: string;
}

export function UpgradeBlock({ message = 'Assine um plano para acessar este recurso.' }: UpgradeBlockProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-10 px-4">
      <Crown size={48} className="text-purple-500/50 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-white mb-2">Plano Necessario</h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">{message}</p>
      <button
        onClick={() => navigate('/dashboard/plans')}
        className="btn-primary inline-flex items-center gap-2 px-6 py-3"
      >
        <Crown size={18} />
        Ver Planos
      </button>
    </div>
  );
}
