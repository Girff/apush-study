import { Link } from 'react-router';
import { Motif } from '../../components/Motif';
import { usePageMeta } from '../../components/ui';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <div className="wrap py-20 text-center">
      <span className="inline-block text-brass">
        <Motif id="compass" className="h-24 w-24" />
      </span>
      <p className="kicker mt-4">Off the map</p>
      <h1 className="mt-2 text-4xl font-semibold">This room isn’t in the exhibit</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">The link may be mistyped, or the room may have moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Back to the Exhibit Hall
        </Link>
        <Link to="/glossary" className="btn btn-secondary">
          Search the glossary
        </Link>
      </div>
    </div>
  );
}
