import { hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import './vendor/dom-flowt/dom-flowt.css';
import './styles.css';

const pathname = window.location.pathname;
const initialUnit = pathname.replace(/\/+$/, '').endsWith('/mar') ? 'mar' : 'serra';
const applicationPage = pathname.startsWith('/candidatura/');
hydrateRoot(document.getElementById('root'), <App initialUnit={initialUnit} applicationPage={applicationPage} />);
