import React, { useEffect, useState } from 'react';

const SvgThumbnails = ({ svgFiles, onSelect, selectedSvg, apiBase, bucket }) => {
  const [svgData, setSvgData] = useState({}); // { fileKey: svgText }

  useEffect(() => {
    // Fetch SVG text for all files (if not already fetched)
    svgFiles.forEach(fileKey => {
      if (!svgData[fileKey]) {
        const url = `${apiBase}/${bucket}/${encodeURIComponent(fileKey)}`;
        fetch(url)
          .then(res => res.text())
          .then(text => {
            setSvgData(prev => ({ ...prev, [fileKey]: text }));
          });
      }
    });
    // eslint-disable-next-line
  }, [svgFiles, apiBase, bucket]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      {svgFiles.map(fileKey => {
        const svgText = svgData[fileKey];
        const dataUrl = svgText
          ? `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`
          : undefined;
        return (
          <div
            key={fileKey}
            style={{
              border: fileKey === selectedSvg ? '2px solid #007aff' : '1px solid #ccc',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              background: fileKey === selectedSvg ? '#e6f0ff' : '#fff',
            }}
            onClick={() => svgText && onSelect(fileKey, svgText)}
            title={fileKey}
          >
            {svgText ? (
              <img src={dataUrl} alt={fileKey} style={{ width: 64, height: 64, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                Loading...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SvgThumbnails;