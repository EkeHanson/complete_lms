import React, { useEffect, useRef, useState } from 'react';
import { scormAPI } from '../../../../config';
import { API_BASE_URL } from '../../../../config';

// Helper to resolve any media URL (local /media, S3, Supabase, etc.)
const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/media/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

const SCORMPlayer = ({ courseId, userId }) => {
  const iframeRef = useRef();
  const [scormUrl, setScormUrl] = useState(null);

  // Expose SCORM API on parent window
  useEffect(() => {
    // Minimal SCORM 1.2 API
    window.API = {
      LMSInitialize: () => "true",
      LMSFinish: () => "true",
      LMSGetValue: (key) => "",
      LMSSetValue: (key, value) => {
        // Use extracted API
        scormAPI.track(courseId, { key, value, user_id: userId });
        return "true";
      },
      LMSCommit: () => "true",
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "",
      LMSGetDiagnostic: () => ""
    };

    // Cleanup on unmount
    return () => {
      delete window.API;
    };
  }, [courseId, userId]);

  useEffect(() => {
    scormAPI.launch(courseId).then(res => {
      let url = res.data.public_url;
      // Force use of HTML5 version if available
      if (url && url.endsWith('index_lms.html')) {
        url = url.replace('index_lms.html', 'index_lms_html5.html');
      }
      setScormUrl(url);
    });
  }, [courseId]);

  console.log("SCORM URL:", scormUrl);

  return scormUrl ? (
    <div style={{ width: '100%', height: '80vh', background: '#f7f5ff', borderRadius: 10, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={resolveMediaUrl(scormUrl)}
        title="SCORM Player"
        width="100%"
        height="100%"
        style={{ border: 'none', minHeight: '80vh', background: '#fff' }}
        allowFullScreen
      />
    </div>
  ) : <div>Loading...</div>;
};

export default SCORMPlayer;