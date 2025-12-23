import { useText } from "../../cms/useText";
import orig from "../assets/orig.jpeg";

export default function About() {
  return (
    <section className="section" id="about">
        <div className="section-header">
            <span className="section-badge">{useText("about.badge")}</span>
            <h2 className="section-title">{useText("about.title")}</h2>
            <p className="section-description">
                {useText("about.description")}
            </p>
        </div>
        <div className="about-grid">
            <div className="about-image"><img src={orig} alt="Фото-реабилитационного-центра" /></div>
            <div className="feature-list">
                <div className="feature">
                    <div className="feature-icon">01</div>
                    <div className="feature-content">
                        <h3>{useText("about.mission.title")}</h3>
                        <p>{useText("about.mission.text")}</p>
                    </div>
                </div>
                <div className="feature">
                    <div className="feature-icon">02</div>
                    <div className="feature-content">
                        <h3>{useText("about.goal.title")}</h3>
                        <p>{useText("about.goal.text")}</p>
                    </div>
                </div>
                <div className="feature">
                    <div className="feature-icon">03</div>
                    <div className="feature-content">
                        <h3>{useText("about.approach.title")}</h3>
                        <p>{useText("about.approach.text")}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}