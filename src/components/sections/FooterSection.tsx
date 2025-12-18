import React from 'react';
import { useText } from '../../cms/useText';

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

interface FooterSectionProps {
  section: Section;
}

const FooterSection: React.FC<FooterSectionProps> = ({ section }) => {
  const items = section.items.sort((a, b) => a.order_index - b.order_index);
  const [titleItem, copyrightItem] = items;

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-content">
          <h3 className="footer-title">{titleItem?.content_key_title && useText(titleItem.content_key_title)}</h3>
          <p className="footer-subtitle">{titleItem?.content_key_text && useText(titleItem.content_key_text)}</p>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-copyright">
          <p>{copyrightItem?.content_key_text && useText(copyrightItem.content_key_text)}</p>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(FooterSection);
