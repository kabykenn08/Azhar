import { useEffect, useState } from 'react';

const translations = {
  ru: {
    preview: "Предпросмотр сайта",
    close: "Закрыть",
    refresh: "Обновить",
    openInNewTab: "Открыть в новой вкладке",
  },
  kz: {
    preview: "Сайтты алдын ала қарау",
    close: "Жабу",
    refresh: "Жаңарту",
    openInNewTab: "Жаңа қойында ашу",
  },
};

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemLang: "ru" | "kz";
}

export default function PreviewModal({ isOpen, onClose, systemLang }: PreviewModalProps) {
  const t = translations[systemLang];
  const [iframeKey, setIframeKey] = useState(0);
  const previewUrl = window.location.origin + '/azhar/';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.origin + '/azhar/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h3>{t.preview}</h3>
          <div className="preview-modal-actions">
            <button 
              className="preview-btn refresh" 
              onClick={handleRefresh}
              title={t.refresh}
            >
              🔄 {t.refresh}
            </button>
            <button 
              className="preview-btn new-tab" 
              onClick={handleOpenInNewTab}
              title={t.openInNewTab}
            >
              🔗 {t.openInNewTab}
            </button>
            <button 
              className="preview-btn close" 
              onClick={onClose}
              title={t.close}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="preview-modal-body">
          <iframe
            key={iframeKey}
            src={previewUrl}
            className="preview-iframe"
            title={t.preview}
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}

