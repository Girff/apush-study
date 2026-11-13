/**
 * The app shell: the home screen (baskets) or a study session, plus dialogs.
 * The browser's Back button closes a dialog or ends a session (it's saved)
 * instead of leaving the site; each layer is one history entry.
 */
import { useCallback, useEffect, useState } from 'react';
import { BASKET, basketsLabel } from './lib/deck';
import { getPrefs, usePrefs } from './lib/prefs';
import { type SessionSpec, createSession, getSession, isResumable, planSession, setSession, specFromPrefs, useSession } from './lib/session';
import { getProgress } from './lib/store';
import { Toaster, toast } from './ui/toast';
import { CardListDialog, type ListSpec } from './views/CardList';
import { type DeckActions, DeckView } from './views/DeckView';
import { HelpDialog } from './views/HelpDialog';
import { SettingsDialog } from './views/SettingsDialog';
import { StudyView } from './views/StudyView';

type Layer = 'study' | 'dialog';
type DialogState = { kind: 'settings' } | { kind: 'help' } | { kind: 'options' } | { kind: 'list'; spec: ListSpec } | null;

const topLayer = (): Layer | null => (history.state?.p4 as Layer | undefined) ?? null;

export function App() {
  const session = useSession();
  usePrefs(); // re-render on theme/text changes
  const [studying, setStudying] = useState(() => {
    // A reload during a session lands back in it.
    if (topLayer() === 'study' && isResumable(getSession())) return true;
    if (topLayer()) history.replaceState(null, '');
    return false;
  });
  const [dialog, setDialog] = useState<DialogState>(null);

  // Back/forward: the history entry on top says which layers are open.
  useEffect(() => {
    const onPop = () => {
      const top = topLayer();
      if (top !== 'dialog') setDialog(null);
      if (top === null) setStudying(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openDialog = useCallback((d: Exclude<DialogState, null>) => {
    if (topLayer() === 'dialog') history.replaceState({ p4: 'dialog' }, '');
    else history.pushState({ p4: 'dialog' }, '');
    setDialog(d);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    if (topLayer() === 'dialog') history.back();
  }, []);

  const enterStudy = useCallback(() => {
    setDialog(null);
    // Replace an open dialog's entry so Back from the session goes home, not to the dialog.
    if (topLayer() === 'dialog') history.replaceState({ p4: 'study' }, '');
    else if (topLayer() !== 'study') history.pushState({ p4: 'study' }, '');
    setStudying(true);
    window.scrollTo(0, 0);
  }, []);

  const exitStudy = useCallback(() => {
    const s = getSession();
    if (s?.finishedAt) setSession(null);
    else if (isResumable(s)) toast('Session saved. Resume it any time.');
    setStudying(false);
    setDialog(null);
    if (topLayer() === 'dialog') history.go(-2);
    else if (topLayer() === 'study') history.back();
  }, []);

  /** Plan and start a session; returns false (with a message) if there's nothing to study. */
  const start = useCallback(
    (spec: SessionSpec, emptyMessage?: string) => {
      const now = Date.now();
      const plan = planSession(spec, getProgress(), now);
      if (plan.items.length === 0) {
        toast(emptyMessage ?? 'No cards to study with these settings.');
        return false;
      }
      setSession(createSession(spec, plan.items, now));
      enterStudy();
      return true;
    },
    [enterStudy],
  );

  const practiceCards = useCallback(
    (ids: string[], label: string) => {
      start({ ...specFromPrefs(getPrefs(), { baskets: [], cardIds: ids, label }), mode: 'practice', filter: 'all', size: 0 }, 'Those cards are all hidden from study.');
    },
    [start],
  );

  const actions: DeckActions = {
    startSelected: () => {
      const p = getProgress();
      start(specFromPrefs(getPrefs(), { baskets: p.selected, label: basketsLabel(p.selected) }));
    },
    startBasket: (basketId) => {
      const prefs = getPrefs();
      const title = BASKET.get(basketId)!.title;
      const spec = specFromPrefs(prefs, { baskets: [basketId], label: title });
      if (prefs.mode === 'spaced' && planSession(spec, getProgress(), Date.now()).items.length === 0) {
        toast(`Nothing in ${title} is due right now.`, { label: 'Practice it', run: () => start({ ...spec, mode: 'practice' }) });
        return;
      }
      start(spec);
    },
    practiceCards,
    resume: enterStudy,
    discard: () => {
      setSession(null);
      toast('Session discarded.');
    },
    openList: (spec) => openDialog({ kind: 'list', spec }),
    openSettings: () => openDialog({ kind: 'settings' }),
    openOptions: () => openDialog({ kind: 'options' }),
    closeOptions: closeDialog,
    openHelp: () => openDialog({ kind: 'help' }),
  };

  const showStudy = studying && !!session && (!!session.finishedAt || session.queue.length > 0);

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-50 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper">
        Skip to content
      </a>
      {showStudy ? (
        <StudyView
          session={session}
          onExit={exitStudy}
          onOpenHelp={actions.openHelp}
          onOpenSettings={actions.openSettings}
          onStudyAgain={() => {
            const spec = session.spec;
            start(spec, spec.mode === 'spaced' ? 'Nothing else is due right now. Try Practice to go again.' : undefined);
          }}
          onPracticeMissed={(ids) => practiceCards(ids, 'Missed cards')}
        />
      ) : (
        <DeckView session={session} actions={actions} optionsOpen={dialog?.kind === 'options'} />
      )}

      {dialog?.kind === 'list' && <CardListDialog spec={dialog.spec} onClose={closeDialog} onStudy={practiceCards} />}
      <SettingsDialog open={dialog?.kind === 'settings'} onClose={closeDialog} />
      <HelpDialog open={dialog?.kind === 'help'} onClose={closeDialog} />
      <Toaster />
    </>
  );
}
