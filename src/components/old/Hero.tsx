import { useText } from "../../cms/useText";

export default function Hero() {
  return (
    <section className="hero">
        <div className="hero-container">
            <div className="hero-content">
                <h1>{useText("hero.title")}</h1>
                <p>{useText("hero.description")}</p>
                <div className="hero-actions">
                    <a href="#contact" className="btn btn-primary">
                        {useText("hero.btnPrimary")}
                    </a>
                    <a href="#services" className="btn btn-outline">
                        {useText("hero.btnSecondary")}
                    </a>
                </div>
            </div>
            <div className="hero-visual">
                <div className="floating-card card-1">
                    <div className="card-icon">100+</div>
                    <p>{useText("hero.card1")}</p>
                </div>
                <div className="floating-card card-2">
                    <div className="card-icon">25+</div>
                    <p>{useText("hero.card2")}</p>
                </div>
                <div className="floating-card card-3">
                    <div className="card-icon">10K+</div>
                    <p>{useText("hero.card3")}</p>
                </div>
            </div>
        </div>
    </section>
  );
}