import React, { useContext, useRef, useEffect } from 'react';
import { CertificateContext } from '../../../contexts/CertificateContext';
import DraggableElement from '../UI/DraggableElement';
import BarcodeGenerator from './BarcodeGenerator';
import './Certificate.css';

// Import template images
import classicTemplate from '../../../assets/templates/classic.jpg';
import modernTemplate from '../../../assets/templates/modern.jpg';
import elegantTemplate from '../../../assets/templates/elegant.png';
import minimalTemplate from '../../../assets/templates/minimal.jpg';

const Certificate = () => {
  const { certificate, updateCompletionTextPosition } = useContext(CertificateContext);
  const certificateRef = useRef(null);
  const { 
    title, 
    recipientName, 
    courseName, 
    completionText,
    date, 
    signatures, 
    logos, 
    barcodeData,
    template = 'classic', 
    templateImage,
    borderColor = '#f1c40f',
    borderWidth = '15px',
    borderStyle = 'solid'
  } = certificate;

  // Map template IDs to their image files
  const templateImages = {
    classic: classicTemplate,
    modern: modernTemplate,
    elegant: elegantTemplate,
    minimal: minimalTemplate
  };

  // Use custom template if available, otherwise use predefined
  const backgroundImage = templateImage || templateImages[template];

  const certificateStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderColor,
    borderWidth,
    borderStyle
  };

  // Fixed dimensions for consistent rendering
  const [dimensions, setDimensions] = React.useState({ width: 1000, height: 707 });

  useEffect(() => {
    const calculateDimensions = () => {
      if (certificateRef.current) {
        const width = certificateRef.current.offsetWidth;
        const height = width * 0.707; // Standard A4 ratio
        setDimensions({ width, height });
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  const handleCompletionTextDrag = (e, data) => {
    updateCompletionTextPosition({ x: data.x, y: data.y });
  };

  return (
    <div className="certificate-wrapper" ref={certificateRef}>
      <div 
        className="certificate-template" 
        style={{
          ...certificateStyle,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          position: 'relative'
        }}
      >
        <div className="certificate-content">
          <h1 className="certificate-title">{title}</h1>
          <p className="certificate-text">This is to certify that</p>
          <h2 className="recipient-name">{recipientName || "[Recipient Name]"}</h2>
          <p className="certificate-text">
            {certificate.completionText || "has successfully completed the course"}
          </p>
          <h3 className="course-name">{courseName || "[Course Name]"}</h3>
          <p className="certificate-text">on this {date}</p>
          
          <div className="signatures-container">
            {signatures.map((sig, index) => (
              <DraggableElement 
                key={index} 
                id={`signature-${index}`} 
                defaultPosition={sig.position}
                bounds="parent"
              >
                <div className="signature-box">
                  <img 
                    src={sig.image} 
                    alt="Signature" 
                    className="signature-image" 
                    style={{ width: '120px', height: 'auto' }}
                  />
                  <p className="signature-name">{sig.name || "[Name]"}</p>
                  <p className="signature-date">{sig.date || "[Date]"}</p>
                </div>
              </DraggableElement>
            ))}
          </div>
        </div>

        {/* Logos */}
        {logos.map((logo, index) => (
          <DraggableElement 
            key={`logo-${index}`} 
            id={`logo-${index}`} 
            defaultPosition={logo?.position || { x: 50, y: 50 }}
            bounds="parent"
          >
            <img 
              src={logo?.image} 
              alt={`Logo ${index + 1}`} 
              className="certificate-logo" 
              style={{
                width: '100px',
                height: 'auto',
                position: 'absolute',
                zIndex: 10
              }}
            />
          </DraggableElement>
        ))}

        {/* Barcode */}
        <div className="barcode-container">
          <BarcodeGenerator data={barcodeData} />
        </div>
      </div>
    </div>
  );
};

export default Certificate;