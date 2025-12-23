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

interface CardsSectionProps {
  section: Section;
}

const CardsSection: React.FC<CardsSectionProps> = ({ section }) => {
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
  const cards = items.filter(i => i.item_type === 'card');
  const isValues = section.section_key === 'values';

  return (
    <section 
      ref={setNode as any}
      className="section" 
      id={section.section_key}
      style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}
    >
      <div className="section-header">
        {header?.content_key_badge && <span className="section-badge">{useText(header.content_key_badge)}</span>}
        <h2 className="section-title">{header?.content_key_title && useText(header.content_key_title)}</h2>
        <p className="section-description">{header?.content_key_text && useText(header.content_key_text)}</p>
      </div>
      
      {isValues ? (
        <div className="values-compact">
          <div className="values-grid-compact">
            {cards.map(card => (
              <div key={card.id} className="value-item">
                <div className="value-icon">{card.icon_text}</div>
                <h3>{card.content_key_title && useText(card.content_key_title)}</h3>
                <p>{card.content_key_text && useText(card.content_key_text)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="services-grid">
          {cards.map(card => (
            <div key={card.id} className="service-card">
              <span className="service-number">{card.icon_text}</span>
              <h3>{card.content_key_title && useText(card.content_key_title)}</h3>
              <p>{card.content_key_text && useText(card.content_key_text)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(CardsSection);
