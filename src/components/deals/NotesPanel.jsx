import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n';

export default function NotesPanel({ deal, onAdd }) {
  const { t, dateTime } = useI18n();
  const [text, setText] = useState('');
  const notes = Array.isArray(deal.notes) ? deal.notes : [];

  const submit = () => {
    if (!text.trim()) return;
    onAdd({ text: text.trim(), at: new Date().toISOString() });
    setText('');
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold">{t('deals.notes')}</h2>
      <div className="mt-3 space-y-2">
        <Textarea
          rows={2}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('deals.notePlaceholder')}
        />
        <Button size="sm" variant="outline" className="rounded-full" onClick={submit} disabled={!text.trim()}>
          {t('deals.addNote')}
        </Button>
      </div>
      {notes.length ? (
        <ul className="mt-4 space-y-2 border-t border-border pt-3">
          {notes.map((note, index) => (
            <li key={`${note.at}-${index}`} className="text-sm">
              <p className="leading-relaxed">{note.text}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{dateTime(note.at)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">{t('deals.noNotes')}</p>
      )}
    </section>
  );
}