import React, { createContext, useState, useCallback } from 'react';

export const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
  const [history, setHistory] = useState([{
    title: "Certificate of Completion",
    recipientName: "",
    courseName: "",
    date: new Date().toLocaleDateString(),
    signatures: [],
    logos: [],
    template: "classic",
    templateImage: null,
    barcodeData: "https://cmvp.net/verification/4b832a6e-bba1-4e15-b7d5-6da5657512f0/ARTS/",
    backgroundColor: 'transparent',
    borderColor: '#f1c40f',
    borderWidth: '15px',
    borderStyle: 'solid',
    completionText: 'has successfully completed the course',
  }]);
  
  const [historyIndex, setHistoryIndex] = useState(0);
  const certificate = history[historyIndex];

  const updateCertificate = useCallback((updates, recordHistory = false) => {
    if (recordHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ ...certificate, ...updates });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[historyIndex] = { ...certificate, ...updates };
        return newHistory;
      });
    }
  }, [certificate, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const addSignature = useCallback((signature) => {
    updateCertificate({
      signatures: [...certificate.signatures, signature]
    }, true);
  }, [certificate.signatures, updateCertificate]);

  const updateSignature = useCallback((index, updates) => {
    const updatedSignatures = [...certificate.signatures];
    updatedSignatures[index] = { ...updatedSignatures[index], ...updates };
    updateCertificate({ signatures: updatedSignatures }, true);
  }, [certificate.signatures, updateCertificate]);

  const removeSignature = useCallback((index) => {
    updateCertificate({
      signatures: certificate.signatures.filter((_, i) => i !== index)
    }, true);
  }, [certificate.signatures, updateCertificate]);

  const addLogo = useCallback((logo) => {
    updateCertificate({
      logos: [...certificate.logos, logo]
    }, true);
  }, [certificate.logos, updateCertificate]);

  const updateLogo = useCallback((index, updates) => {
    const updatedLogos = [...certificate.logos];
    updatedLogos[index] = { ...updatedLogos[index], ...updates };
    updateCertificate({ logos: updatedLogos }, true);
  }, [certificate.logos, updateCertificate]);

  const removeLogo = useCallback((index) => {
    updateCertificate({
      logos: certificate.logos.filter((_, i) => i !== index)
    }, true);
  }, [certificate.logos, updateCertificate]);

  const updateCompletionTextPosition = useCallback((position) => {
    updateCertificate({
      completionTextPosition: position
    });
  }, [updateCertificate]);

  return (
    <CertificateContext.Provider value={{
      certificate,
      updateCertificate,
      history,
      historyIndex,
      undo,
      redo,
      addSignature,
      updateSignature,
      removeSignature,
      addLogo,
      updateLogo,
      removeLogo,
      updateCompletionTextPosition
    }}>
      {children}
    </CertificateContext.Provider>
  );
};