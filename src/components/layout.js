import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/300.css';
import s from './layout.module.css';
// import Controls from './controls';
import Three from './ThreeJS';

export default function Layout() {
  return (
    <div id={s.pagewrap}>
      <div id={s.wrap}>
        <Three loaded={true} />
      </div>
    </div>
  );
}
