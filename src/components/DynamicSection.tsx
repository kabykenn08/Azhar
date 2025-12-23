import { useText } from "../cms/useText";
import orig from "../assets/orig.jpeg";

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

interface DynamicSectionProps {
  section: Section;
}

export default function DynamicSection({ section }: DynamicSectionProps) {
  const items = section.items.sort((a, b) => a.order_index - b.order_index);
  const header = items.find(i => i.item_type === 'header');
  const contentItems = items.filter(i => i.item_type !== 'header');

  
  if (section.section_type === 'hero') {
    const buttons = items.filter(i => i.item_type === 'description');
    const cards = items.filter(i => i.item_type === 'hero_card');
    
    return (
      <section className="hero">
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
  }

  
  if (section.section_type === 'features') {
    const features = contentItems.filter(i => i.item_type === 'feature');
    
    return (
      <section className="section" id={section.section_key}>
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
  }

  
  if (section.section_type === 'cards') {
    const cards = contentItems.filter(i => i.item_type === 'card');
    const isValues = section.section_key === 'values';
    
    return (
      <section className="section" id={section.section_key}>
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
  }

  
  if (section.section_type === 'contact') {
    const contactItems = contentItems.filter(i => i.item_type === 'contact_item');
    const leftItems = contactItems.slice(0, 2);
    const rightItems = contactItems.slice(2);
    
    return (
      <section className="section" id={section.section_key}>
        <div className="contact-wrapper">
          <div className="contact-container">
            <div className="contact-grid">
              <div className="contact-info">
                <h2>{header?.content_key_title && useText(header.content_key_title)}</h2>
                <p>{header?.content_key_text && useText(header.content_key_text)}</p>
                <div className="contact-items">
                  {leftItems.map(item => (
                    <div key={item.id} className="contact-item">
                      <div className="contact-icon">{item.icon_text}</div>
                      <div className="contact-details">
                        <h4>{item.content_key_title && useText(item.content_key_title)}</h4>
                        <p>{item.content_key_text && useText(item.content_key_text)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="contact-items">
                {rightItems.map(item => {
                  const isPhone = item.metadata?.type === 'phone';
                  const phones = item.metadata?.phones || [];
                  
                  return (
                    <div key={item.id} className="contact-item">
                      <div className="contact-icon">{item.icon_text}</div>
                      <div className="contact-details">
                        <h4>{item.content_key_title && useText(item.content_key_title)}</h4>
                        {isPhone ? (
                          <>
                            {phones.map((phone: string, idx: number) => (
                              <p key={idx}>
                                <a href={phone}>{phone.replace('tel:', '').replace('+7', '8 ')}</a>
                              </p>
                            ))}
                          </>
                        ) : (
                          <div className="contact-text-wrapper">
                            {item.content_key_text && (() => {
                              const text = useText(item.content_key_text);
                              
                              const lunchMarkers = /(Обед:|Lunch:|Ас:|Ас таймағы:|Демалыс:|Түскі ас:)/i;
                              const match = text.match(lunchMarkers);
                              if (match) {
                                const marker = match[0];
                                const index = match.index!;
                                const beforeLunch = text.substring(0, index).trim();
                                const afterLunch = text.substring(index + marker.length).trim();
                                
                                const result = [];
                                if (beforeLunch) {
                                  result.push(beforeLunch);
                                }
                                if (afterLunch) {
                                  
                                  const lunchText = marker + ' ' + afterLunch;
                                  result.push(lunchText);
                                }
                                
                                return result.map((line, idx) => (
                                  <p key={idx}>{line}</p>
                                ));
                              }
                              
                              const lines = text.split(/[.。]/).filter(line => line.trim());
                              if (lines.length > 1) {
                                return lines.map((line, idx) => (
                                  <p key={idx}>{line.trim()}{idx < lines.length - 1 ? '.' : ''}</p>
                                ));
                              }
                              // Если ничего не подошло, возвращаем как есть
                              return <p>{text}</p>;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // FOOTER
  if (section.section_type === 'footer') {
    const [titleItem, copyrightItem] = contentItems;
    
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
  }

  return null;
}