import React, { useContext, useState, useRef, useEffect } from 'react';
import { CertificateContext } from '../../../contexts/CertificateContext';
import SignatureManager from './SignatureManager';
import LogoManager from './LogoManager';
import CertificateTemplates from './CertificateTemplates';
import { ChromePicker } from 'react-color';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Certificate.css';

const CertificateControls = () => {
  const { certificate, updateCertificate } = useContext(CertificateContext);
  const [activeTab, setActiveTab] = useState('details');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showBorderPicker, setShowBorderPicker] = useState(false);
  const [borderWidth, setBorderWidth] = useState(certificate.borderWidth || '15px');
  const [borderStyle, setBorderStyle] = useState(certificate.borderStyle || 'solid');
  
  const tabsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateCertificate({ [name]: value });
  };

  const handleColorChange = (colorType, color) => {
    updateCertificate({ [colorType]: color.hex });
  };

  const handleBorderWidthChange = (e) => {
    const value = e.target.value;
    setBorderWidth(value);
    updateCertificate({ borderWidth: value });
  };

  const handleBorderStyleChange = (e) => {
    const value = e.target.value;
    setBorderStyle(value);
    updateCertificate({ borderStyle: value });
  };

  const handleScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check scroll position on mount and resize
  useEffect(() => {
    const checkScroll = () => {
      if (tabsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="certificate-controls">
      <div className="tabs-container">
        {showLeftArrow && (
          <button 
            className="scroll-button left"
            onClick={() => scrollTabs('left')}
            aria-label="Scroll tabs left"
          >
            <FaChevronLeft />
          </button>
        )}
        
        <div 
          className="control-tabs"
          ref={tabsRef}
          onScroll={handleScroll}
        >
          <button 
            className={activeTab === 'details' ? 'active' : ''} 
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={activeTab === 'design' ? 'active' : ''} 
            onClick={() => setActiveTab('design')}
          >
            Design
          </button>
          <button 
            className={activeTab === 'signatures' ? 'active' : ''} 
            onClick={() => setActiveTab('signatures')}
          >
            Signatures
          </button>
          <button 
            className={activeTab === 'logos' ? 'active' : ''} 
            onClick={() => setActiveTab('logos')}
          >
            Logos
          </button>
          <button 
            className={activeTab === 'templates' ? 'active' : ''} 
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>

        {showRightArrow && (
          <button 
            className="scroll-button right"
            onClick={() => scrollTabs('right')}
            aria-label="Scroll tabs right"
          >
            <FaChevronRight />
          </button>
        )}
      </div>

      <div className="control-content">
        {activeTab === 'details' && (
          <div className="details-controls">
            <div className="form-group">
              <label>Certificate Title</label>
              <input
                type="text"
                name="title"
                value={certificate.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Recipient Name</label>
              <input
                type="text"
                name="recipientName"
                value={certificate.recipientName}
                onChange={handleInputChange}
                placeholder="Enter recipient name"
              />
            </div>
            <div className="form-group">
              <label>Course Name</label>
              <input
                type="text"
                name="courseName"
                value={certificate.courseName}
                onChange={handleInputChange}
                placeholder="Enter course name"
              />
            </div>

            <div className="form-group">
              <label>Completion Text</label>
              <input
                type="text"
                name="completionText"
                value={certificate.completionText}
                onChange={(e) => updateCertificate({ completionText: e.target.value })}
                placeholder="Completion text (e.g., 'has successfully completed the course')"
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={certificate.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Barcode URL</label>
              <input
                type="text"
                name="barcodeData"
                value={certificate.barcodeData}
                onChange={handleInputChange}
                placeholder="Enter verification URL"
              />
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="design-controls">
            <div className="color-picker-group">
              <label>Background Color</label>
              <div className="color-picker-wrapper">
                <button 
                  className="color-picker-button"
                  style={{ backgroundColor: certificate.backgroundColor || '#ffffff' }}
                  onClick={() => setShowBgPicker(!showBgPicker)}
                />
                {showBgPicker && (
                  <div className="color-picker-popup">
                    <ChromePicker
                      color={certificate.backgroundColor || '#ffffff'}
                      onChangeComplete={(color) => handleColorChange('backgroundColor', color)}
                    />
                    <button 
                      className="close-picker"
                      onClick={() => setShowBgPicker(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="color-picker-group">
              <label>Border Color</label>
              <div className="color-picker-wrapper">
                <button 
                  className="color-picker-button"
                  style={{ backgroundColor: certificate.borderColor || '#f1c40f' }}
                  onClick={() => setShowBorderPicker(!showBorderPicker)}
                />
                {showBorderPicker && (
                  <div className="color-picker-popup">
                    <ChromePicker
                      color={certificate.borderColor || '#f1c40f'}
                      onChangeComplete={(color) => handleColorChange('borderColor', color)}
                    />
                    <button 
                      className="close-picker"
                      onClick={() => setShowBorderPicker(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Border Width</label>
              <select 
                value={borderWidth} 
                onChange={handleBorderWidthChange}
                className="border-width-select"
              >
                <option value="1px">Thin (1px)</option>
                <option value="5px">Medium (5px)</option>
                <option value="10px">Thick (10px)</option>
                <option value="15px">Extra Thick (15px)</option>
                <option value="20px">Very Thick (20px)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Border Style</label>
              <select 
                value={borderStyle} 
                onChange={handleBorderStyleChange}
                className="border-style-select"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
                <option value="groove">Groove</option>
                <option value="ridge">Ridge</option>
                <option value="inset">Inset</option>
                <option value="outset">Outset</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'signatures' && <SignatureManager />}
        {activeTab === 'logos' && <LogoManager />}
        {activeTab === 'templates' && <CertificateTemplates />}
      </div>
    </div>
  );
};

export default CertificateControls;