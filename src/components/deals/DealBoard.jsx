import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useI18n } from '@/i18n';
import DealCard from './DealCard';
import { ALL_STAGES } from '@/lib/deals';

export default function DealBoard({ deals, onMove }) {
  const { t } = useI18n();
  const columns = ALL_STAGES.map((stage) => ({
    stage,
    items: deals.filter((deal) => (deal.stage || 'inquiry') === stage),
  }));

  const handleEnd = (result) => {
    if (!result.destination) return;
    const deal = deals.find((item) => item.id === result.draggableId);
    const stage = result.destination.droppableId;
    if (!deal || deal.stage === stage) return;
    onMove(deal, stage);
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
                className={`w-[250px] shrink-0 rounded-2xl border border-border p-2 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-secondary/70' : 'bg-card/40'
                }`}
              >
                <div className="flex items-center justify-between px-1 pb-2">
                  <p className="label-xs">{t(`deals.stages.${stage}`)}</p>
                  <span className="text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((deal, index) => (
                    <Draggable draggableId={deal.id} index={index} key={deal.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                          <DealCard deal={deal} dragging={dragSnapshot.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {items.length === 0 ? (
                    <p className="px-1 py-3 text-[11px] text-muted-foreground">{t('deals.emptyStage')}</p>
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