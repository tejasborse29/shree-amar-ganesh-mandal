import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export default Skeleton;
