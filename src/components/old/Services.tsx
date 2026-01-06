import { useText } from "../../cms/useText";

export default function Services() {
  return (
    <section className="section" id="services">
        <div className="section-header">
            <span className="section-badge">{useText("services.badge")}</span>
            <h2 className="section-title">{useText("services.title")}</h2>
            <p className="section-description">
                {useText("services.description")}
            </p>
        </div>
        <div className="services-grid">
            <div className="service-card">
                <span className="service-number">01</span>
                <h3>{useText("services.items.s1.title")}</h3>
                <p>{useText("services.items.s1.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">02</span>
                <h3>{useText("services.items.s2.title")}</h3>
                <p>{useText("services.items.s2.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">03</span>
                <h3>{useText("services.items.s3.title")}</h3>
                <p>{useText("services.items.s3.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">04</span>
                <h3>{useText("services.items.s4.title")}</h3>
                <p>{useText("services.items.s4.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">05</span>
                <h3>{useText("services.items.s5.title")}</h3>
                <p>{useText("services.items.s5.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">06</span>
                <h3>{useText("services.items.s6.title")}</h3>
                <p>{useText("services.items.s6.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">07</span>
                <h3>{useText("services.items.s7.title")}</h3>
                <p>{useText("services.items.s7.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">08</span>
                <h3>{useText("services.items.s8.title")}</h3>
                <p>{useText("services.items.s8.text")}</p>
            </div>
            <div className="service-card">
                <span className="service-number">09</span>
                <h3>{useText("services.items.s9.title")}</h3>
                <p>{useText("services.items.s9.text")}</p>
            </div>
        </div>
    </section>
  );
}