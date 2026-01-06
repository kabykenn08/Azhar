import { useText } from "../cms/useText";

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-content">
          <h3 className="footer-title">{useText("footer.title")}</h3>
          <p className="footer-subtitle">{useText("footer.subtitle")}</p>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-center">
            <p>Ажар</p>
        </div>
        <div className="footer-copyright">
          <p>{useText("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
