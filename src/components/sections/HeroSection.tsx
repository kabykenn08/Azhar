import React, { useEffect } from 'react';
import { useText } from '../../cms/useText';
import { useIntersectionObserver } from '../useIntersectionObserver';

interface SectionItem {
  id: string;
  item_type: string;
  content_key_badge?: string;
  content_key_title?: string;
  content_key_text?: string;
  icon_text?: string;
  order_index: number;
  metadata?: any;
}

interface Section {
  id: string;
  section_key: string;
  section_type: string;
  order_index: number;
  css_classes: string;
  grid_columns?: number;
  items: SectionItem[];
}

interface HeroSectionProps {
  section: Section;
}

const HeroSection: React.FC<HeroSectionProps> = ({ section }) => {
  const [setNode, entry] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (entry?.isIntersecting) {
      const element = entry.target as HTMLElement;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  }, [entry]);

  const items = section.items.sort((a, b) => a.order_index - b.order_index);
  const header = items.find(i => i.item_type === 'header');
  const buttons = items.filter(i => i.item_type === 'description');
  const cards = items.filter(i => i.item_type === 'hero_card');

  return (
    <section 
      ref={setNode as any}
      className="hero" 
      style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
    >
      <div className="hero-container">
        <div className="hero-content">
          <h1>{header?.content_key_title && useText(header.content_key_title)}</h1>
          <p>{header?.content_key_text && useText(header.content_key_text)}</p>
          <div className="hero-actions">
            {buttons.map(btn => (
              <a 
                key={btn.id}
                href={btn.metadata?.btnLink || '#'} 
                className={`btn btn-${btn.metadata?.btnType || 'primary'}`}
              >
                {btn.content_key_title && useText(btn.content_key_title)}
              </a>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          {cards.map(card => (
            <div key={card.id} className={`floating-card ${card.metadata?.position || ''}`}>
              <div className="card-icon">{card.icon_text}</div>
              <p>{card.content_key_text && useText(card.content_key_text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);
