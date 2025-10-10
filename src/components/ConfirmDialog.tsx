import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  variant = 'warning',
  loading = false,
}: ConfirmDialogProps) {
  if (!visible) return null;

  const variantColors = {
    danger: { bg: '#8B4513', border: '#6B3410' },
    warning: { bg: '#FFB300', border: '#F57C00' },
    info: { bg: '#FFB300', border: '#F57C00' },
  };

  const colors = variantColors[variant];

  return (
    <div
      className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-5"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm"
        style={{
          animation: 'scaleIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#FFE082' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E1' }}
            >
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-lg"
                style={{ color: colors.bg }}
              />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#8B4513' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'transparent',
              color: '#8B4513'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF8E1'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-base leading-relaxed" style={{ color: '#666' }}>{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t rounded-b-3xl" style={{ borderColor: '#FFE082', backgroundColor: '#FFF8E1' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border-2 bg-white font-bold text-base transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#E0E0E0', color: '#8B4513' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-white text-base shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: `linear-gradient(90deg, ${colors.bg} 0%, ${colors.border} 100%)`,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Siliniyor...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

