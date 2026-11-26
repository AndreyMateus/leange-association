import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export function render(pathname = '/') {
  const initialUnit = pathname.endsWith('/mar') ? 'mar' : 'serra';
  const applicationPage = pathname.startsWith('/candidatura/');
  return renderToString(<App initialUnit={initialUnit} applicationPage={applicationPage} />);
}
