import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export function render(pathname = '/') {
  const initialUnit = pathname.replace(/\/+$/, '').endsWith('/mar') ? 'mar' : 'serra';
    return renderToString(<App initialUnit={initialUnit} />);
}
