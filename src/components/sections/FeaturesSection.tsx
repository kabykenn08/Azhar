import React, { useEffect } from 'react';
import { useText } from '../../cms/useText';
import { useIntersectionObserver } from '../useIntersectionObserver';
import orig from '../../assets/orig.jpeg';

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

interface FeaturesSectionProps {
  section: Section;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ section }) => {
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
  const features = items.filter(i => i.item_type === 'feature');

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
      <div className="about-grid">
        <div className="about-image">
          <img src={orig} alt="Фото реабилитационного центра" />
        </div>
        <div className="feature-list">
          {features.map(feature => (
            <div key={feature.id} className="feature">
              <div className="feature-icon">{feature.icon_text}</div>
              <div className="feature-content">
                <h3>{feature.content_key_title && useText(feature.content_key_title)}</h3>
                <p>{feature.content_key_text && useText(feature.content_key_text)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(FeaturesSection);
