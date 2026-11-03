import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Flag, Paperclip, Send, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import ReportDialog from '@/components/report/ReportDialog';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { t, dateTime } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c');
  const [conversations, setConversations] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const active = useMemo(() => (conversations || []).find((item) => item.id === activeId), [conversations, activeId]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    const page = await base44.entities.Conversation.filter({}, { sort: '-last_message_at', limit: 50 });
    setConversations(page.items || []);
  }, [user?.id]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    const page = await base44.entities.Message.filter({ conversation_id: conversationId }, { sort: 'created_date', limit: 200 });
    const items = page.items || [];
    setMessages(items);
    const unread = items.filter((message) => !(message.read_by || []).includes(user.id));
    if (unread.length) {
      await Promise.all(unread.map((message) => base44.entities.Message.update(message.id, { read_by: [...(message.read_by || []), user.id] })));
      const conversation = conversations?.find((item) => item.id === conversationId);
      if (conversation) {
        await base44.entities.Conversation.update(conversationId, { unread: { ...(conversation.unread || {}), [user.id]: 0 } });
      }
    }
  }, [conversations, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    loadConversations();
  }, [isAuthenticated, loadConversations, navigateToLogin]);

  useEffect(() => {
    loadMessages(activeId);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!activeId) return undefined;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === activeId && event.type === 'create') loadMessages(activeId);
    });
    return unsubscribe;
  }, [activeId, loadMessages]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      const otherId = (active.participants || []).find((participant) => participant !== user.id);
      await base44.entities.Message.create({
        conversation_id: active.id,
        participants: active.participants,
        body: draft.trim(),
        read_by: [user.id],
      });
      await base44.entities.Conversation.update(active.id, {
        last_message: draft.trim(),
        last_message_at: new Date().toISOString(),
        unread: { ...(active.unread || {}), [otherId]: (active.unread?.[otherId] || 0) + 1 },
      });
      setDraft('');
      loadMessages(active.id);
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  const attach = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !active) return;
    setUploading(true);
    try {
      const { file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const otherId = (active.participants || []).find((participant) => participant !== user.id);
      await base44.entities.Message.create({
        conversation_id: active.id,
        participants: active.participants,
        body: file.name,
        attachments: [{ file_uri: fileUri, name: file.name, size: file.size }],
        read_by: [user.id],
      });
      await base44.entities.Conversation.update(active.id, {
        last_message: file.name,
        last_message_at: new Date().toISOString(),
        unread: { ...(active.unread || {}), [otherId]: (active.unread?.[otherId] || 0) + 1 },
      });
      loadMessages(active.id);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openAttachment = async (attachment) => {
    const { data } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: attachment.file_uri, expires_in: 300 });
    window.open(data.signed_url, '_blank', 'noopener');
  };

  const blockToggle = async () => {
    const otherId = (active.participants || []).find((participant) => participant !== user.id);
    const blocked = active.blocked_by || [];
    const next = blocked.includes(user.id) ? blocked.filter((id) => id !== user.id) : [...blocked, user.id];
    await base44.entities.Conversation.update(active.id, { blocked_by: next });
    loadConversations();
  };

  if (conversations === null) return <Loading className="py-24" />;

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.messages')} title={t('messages.title')} compact />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        {conversations.length === 0 ? (
          <EmptyState
            icon={Send}
            title={t('messages.empty')}
            text={t('messages.emptyHint')}
            actionLabel={t('nav.buy')}
            actionTo="/search?deal=rent"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
            <ul className={cn('space-y-2', activeId ? 'hidden lg:block' : 'block')}>
              {conversations.map((conversation) => {
                const otherId = (conversation.participants || []).find((participant) => participant !== user.id);
                const unread = conversation.unread?.[user.id] || 0;
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => setParams({ c: conversation.id })}
                      className={cn(
                        'w-full rounded-2xl border p-3 text-left transition-colors',
                        conversation.id === activeId ? 'border-primary/40 bg-secondary/60' : 'border-border bg-card hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{conversation.participant_names?.[otherId] || t('roles.owner')}</p>
                        {unread ? (
                          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">{unread}</span>
                        ) : null}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{conversation.listing_title}</p>
                      <p className="mt-1 truncate text-xs text-foreground/70">{conversation.last_message}</p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <section className={cn('flex min-h-[60vh] flex-col rounded-2xl border border-border bg-card', !activeId && 'hidden lg:flex')}>
              {!active ? (
                <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">{t('messages.select')}</div>
              ) : (
                <>
                  <header className="flex items-center gap-2 border-b border-border p-3">
                    <button type="button" onClick={() => setParams({})} className="lg:hidden" aria-label={t('common.back')}>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold">
                        {active.participant_names?.[(active.participants || []).find((id) => id !== user.id)] || t('messages.aboutListing')}
                      </p>
                      {active.listing_id ? (
                        <Link to={`/listing/${active.listing_id}`} className="truncate text-[11px] text-muted-foreground hover:underline">
                          {active.listing_title}
                        </Link>
                      ) : null}
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={blockToggle}>
                      <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                      {(active.blocked_by || []).includes(user.id) ? t('messages.unblock') : t('messages.block')}
                    </Button>
                    <ReportDialog targetType="message" targetId={active.id} targetLabel={active.listing_title || t('messages.title')} />
                  </header>

                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.map((message) => {
                      const mine = message.created_by_id === user.id;
                      return (
                        <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm', mine ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground')}>
                            {(message.attachments || []).map((attachment) => (
                              <button key={attachment.file_uri} type="button" onClick={() => openAttachment(attachment)} className="mb-1 flex items-center gap-1.5 underline">
                                <Paperclip className="h-3.5 w-3.5" />{attachment.name}
                              </button>
                            ))}
                            {message.body}
                            <p className={cn('mt-1 text-[10px]', mine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                              {dateTime(message.created_date)} {mine ? `· ${t('messages.read')}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {(active.blocked_by || []).length ? (
                    <p className="border-t border-border px-4 py-2 text-center text-xs text-destructive">{t('messages.blocked')}</p>
                  ) : null}

                  <div className="flex items-end gap-2 border-t border-border p-3">
                    <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label={t('messages.attach')}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <input ref={fileRef} type="file" className="hidden" onChange={attach} />
                    <Textarea
                      rows={1}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          send();
                        }
                      }}
                      placeholder={t('messages.placeholder')}
                      className="min-h-10 flex-1 resize-none"
                    />
                    <Button size="icon" className="shrink-0 rounded-full" onClick={send} disabled={sending || !draft.trim()} aria-label={t('messages.send')}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="px-3 pb-2 text-[10px] text-muted-foreground">{t('footer.mockNote')}</p>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}