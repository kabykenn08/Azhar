import { useText } from "../../cms/useText";

export default function Contact() {
  return (
    <section className="section" id="contact">
        <div className="contact-wrapper">
            <div className="contact-container">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>{useText("contact.title")}</h2>
                        <p>{useText("contact.description")}</p>
                        <div className="contact-items">
                            <div className="contact-item">
                                <div className="contact-icon">📍</div>
                                <div className="contact-details">
                                    <h4>{useText("contact.address.title")}</h4>
                                    <p>{useText("contact.address.text")}</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">💳</div>
                                <div className="contact-details">
                                    <h4>{useText("contact.osms.title")}</h4>
                                    <p>{useText("contact.osms.text")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="contact-items">
                        <div className="contact-item">
                            <div className="contact-icon">📞</div>
                            <div className="contact-details">
                                <h4>{useText("contact.registry.title")}</h4>
                                <p><a href="tel:555210">55-52-10</a></p>
                                <p><a href="tel:+77084665715">8 (708) 466-57-15</a></p>
                        </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">☎</div>
                            <div className="contact-details">
                                <h4>{useText("contact.hotline.title")}</h4>
                                <p><a href="tel:553204">55-32-04</a></p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">⏰</div>
                            <div className="contact-details">
                                <h4>{useText("contact.schedule.title")}</h4>
                                <p>{useText("contact.schedule.text")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}