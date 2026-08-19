import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global & Component CSS
import './styles/variables.css';
import './styles/global.css';
import './styles/navbar.css';
import './styles/hero.css';
import './styles/components.css';
import './styles/admin.css';
import './styles/receipt.css';
import './styles/charts.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
