/**
 * Animation features for `m` components, loaded after first paint so the
 * landing page's critical script stays small. Route chunks that use the full
 * `motion` component bring their own features.
 */
import { domAnimation } from 'framer-motion';

export default domAnimation;
