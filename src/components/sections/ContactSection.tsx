import React, { useEffect } from "react";
import { useText } from "../../cms/useText";
import { useIntersectionObserver } from "../useIntersectionObserver";

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

interface ContactSectionProps {
  section: Section;
}

const ContactSection: React.FC<ContactSectionProps> = ({ section }) => {
  const [setNode, entry] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    if (entry?.isIntersecting) {
      const element = entry.target as HTMLElement;
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  }, [entry]);

  const items = section.items.sort((a, b) => a.order_index - b.order_index);
  const header = items.find((i) => i.item_type === "header");
  const contactItems = items.filter((i) => i.item_type === "contact_item");
  const leftItems = contactItems.slice(0, 2);
  const rightItems = contactItems.slice(2);

  return (
    <section
      ref={setNode as any}
      className="section"
      id={section.section_key}
      style={{
        opacity: 0,
        transform: "translateY(30px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div className="contact-wrapper">
        <div className="contact-container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>
                {header?.content_key_title && useText(header.content_key_title)}
              </h2>
              <p>
                {header?.content_key_text && useText(header.content_key_text)}
              </p>
              <div className="contact-items">
                {leftItems.map((item) => (
                  <div key={item.id} className="contact-item">
                    <div className="contact-icon">{item.icon_text}</div>
                    <div className="contact-details">
                      <h4>
                        {item.content_key_title &&
                          useText(item.content_key_title)}
                      </h4>
                      <p>
                        {item.content_key_text &&
                          useText(item.content_key_text)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-items">
              {rightItems.map((item) => {
                const isPhone = item.metadata?.type === "phone";
                const phones = item.metadata?.phones || [];

                return (
                  <div key={item.id} className="contact-item">
                    <div className="contact-icon">{item.icon_text}</div>
                    <div className="contact-details">
                      <h4>
                        {item.content_key_title &&
                          useText(item.content_key_title)}
                      </h4>
                      {isPhone ? (
                        <>
                          {phones.map((phone: string, idx: number) => (
                            <p key={idx}>
                              <a href={phone}>
                                {phone.replace("tel:", "").replace("+7", "8 ")}
                              </a>
                            </p>
                          ))}
                        </>
                      ) : (
                        <div className="contact-text-wrapper">
                          {item.content_key_text &&
                            (() => {
                              const text = useText(item.content_key_text);
                              
                              
                              const lunchMarkers =
                                /(Обед:|Lunch:|Ас:|Ас таймағы:|Демалыс:|Түскі ас:)/i;
                              const match = text.match(lunchMarkers);
                              if (match) {
                                const marker = match[0];
                                const index = match.index!;
                                const beforeLunch = text
                                  .substring(0, index)
                                  .trim();
                                const afterLunch = text
                                  .substring(index + marker.length)
                                  .trim();

                                const result = [];
                                if (beforeLunch) {
                                  result.push(beforeLunch);
                                }
                                if (afterLunch) {
                                  const lunchText = marker + " " + afterLunch;
                                  result.push(lunchText);
                                }

                                return result.map((line, idx) => (
                                  <p key={idx}>{line}</p>
                                ));
                              }
                              const lines = text
                                .split(/[.。]/)
                                .filter((line) => line.trim());
                              if (lines.length > 1) {
                                return lines.map((line, idx) => (
                                  <p key={idx}>
                                    {line.trim()}
                                    {idx < lines.length - 1 ? "." : ""}
                                  </p>
                                ));
                              }
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
};

export default React.memo(ContactSection);
