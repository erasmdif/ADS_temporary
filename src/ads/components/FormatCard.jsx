import React, { useState } from "react";
import { Link, assetUrl } from "../services/paths.jsx";

const FormatCard = ({ title, subtitle, link, image, titleColor = "white", subtitleColor = "white", style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="text-center d-flex flex-column align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        padding: "20px",
        height: "400px", // Assicura altezza uniforme
        transition: "transform 0.3s ease-in-out",
        transform: isHovered ? "scale(1.05)" : "scale(1)", // Effetto ingrandimento hover
        ...style, // Permette di passare stili personalizzati dall’MDX
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={link} className="w-100 text-decoration-none">
        <div className="text-container">
          <h3 className="fw-bold" style={{ color: titleColor }}>{title}</h3>
          <hr style={{ width: "60px", height: "2px", backgroundColor: titleColor, border: "none", margin: "8px auto" }} />
          <p className="fw-bold small" style={{ color: subtitleColor }}>{subtitle}</p>
        </div>
      </Link>
    </div>
  );
};

export default FormatCard;
