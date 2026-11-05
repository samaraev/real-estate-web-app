import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LeadCard from './LeadCard';
import { useI18n } from '@/i18n';

export const CRM_STAGES = ['new', 'contacted', 'viewing', 'negotiation', 'won', 'lost'];

export default function LeadBoard({ leads, onMove, onOpen }) {
  const { t } = useI18n();
  const columns = CRM_STAGES.map((stage) => ({
    stage,
    items: leads.filter((lead) => (lead.stage || 'new') === stage),
  }));

  const handleEnd = (result) => {
    if (!result.destination) return;
    const lead = leads.find((item) => item.id === result.draggableId);
    const stage = result.destination.droppableId;
    if (!lead || lead.stage === stage) return;
    onMove(lead, stage);
  };

  return (
    <DragDropContext onDragEnd={handleEnd}>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-3">
        {columns.map(({ stage, items }) => (
          <Droppable droppableId={stage} key={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`w-[240px] shrink-0 rounded-2xl border border-border p-2 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-secondary/70' : 'bg-card/40'
                }`}
              >
                <div className="flex items-center justify-between px-1 pb-2">
                  <p className="label-xs">{t(`crm.stages.${stage}`)}</p>
                  <span className="text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((lead, index) => (
                    <Draggable draggableId={lead.id} index={index} key={lead.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                          <LeadCard lead={lead} dragging={dragSnapshot.isDragging} onOpen={() => onOpen(lead)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {items.length === 0 ? (
                    <p className="px-1 py-3 text-[11px] text-muted-foreground">{t('crm.emptyStage')}</p>
                  ) : null}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}