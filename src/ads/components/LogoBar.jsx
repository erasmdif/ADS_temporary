import { assetUrl, localUrl } from "../services/paths.jsx";
import React from "react"
import { Container, Row, Col } from "react-bootstrap"

const logos = [
  {
    src: assetUrl("/images/logo_nextgenerationEU.png"),
    alt: "NextGenerationEU",
  },
  {
    src: assetUrl("/images/logo_Ministero.png"),
    alt: "Ministero dell’Università e della Ricerca",
  },
  {
    src: assetUrl("/images/logo_italiadomani.png"),
    alt: "Italia Domani - PNRR",
  },
  {
    src: assetUrl("/images/logo_changes.png"),
    alt: "CHANGES",
  },
  {
    src: assetUrl("/images/logo_sapienza.png"),
    alt: "Sapienza Università di Roma",
  },
]

const containerStyle = {
  backgroundColor: "#2b65af",
  marginTop: "5rem",
  marginBottom: "5rem",
}

const logoWrapperStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.25rem 1rem", // ⬅️ solo 4px sopra e sotto
  height: "100%",
}

const imgStyle = {
  maxHeight: "100px",
}

const LogoBar = () => {
  return (
    <Container fluid style={containerStyle}>
      <Row className="align-items-center justify-content-center text-center g-0 flex-wrap">
        {logos.map((logo, idx) => (
          <Col
            key={logo.alt}
            xs={12}
            sm
            className={idx !== 0 ? "border-start" : ""}
          >
            <div style={logoWrapperStyle}>
              <img
                src={logo.src}
                alt={logo.alt}
                className="img-fluid d-block"
                style={imgStyle}
              />
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default LogoBar
