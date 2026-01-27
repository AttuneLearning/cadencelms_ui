import ReactDOM from 'react-dom/client';
import { App } from './app';
import './app/styles/globals.css';

// Temporarily disable StrictMode to debug ISS-008 loops
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
