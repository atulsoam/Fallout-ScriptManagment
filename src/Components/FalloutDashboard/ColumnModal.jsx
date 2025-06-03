import React, { useState, useEffect } from 'react';
import ModalCard from "../UI/ModelCard";
import { FaGripVertical } from 'react-icons/fa';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableItem = ({ id, checked, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer transition"
    >
      <div className="flex items-center gap-2">
        <span {...attributes} {...listeners} className="cursor-move text-gray-500">
          <FaGripVertical />
        </span>
        <span className="text-sm text-gray-700 capitalize">
          {id.replace(/([a-z])([A-Z])/g, '$1 $2')}
        </span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-blue-600"
      />
    </div>
  );
};

const ColumnModal = ({ open, onClose, selectedColumns, setSelectedColumns, allKeys }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  // Keep internal order state for rendering & sorting
  const [columnOrder, setColumnOrder] = useState(allKeys);

  useEffect(() => {
    setColumnOrder(allKeys);
  }, [allKeys]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columnOrder.indexOf(active.id);
    const newIndex = columnOrder.indexOf(over.id);

    const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);
  };

  const toggleColumn = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  console.log(allKeys);

  const selectAll = () => setSelectedColumns([...columnOrder]);

  const deselectAll = () => setSelectedColumns([]);

  if (!open) return null;

  return (
    <ModalCard
      title="📋 Select Columns"
      onClose={() => {
        // Reorder selectedColumns on close to match reordered columnOrder
        const reorderedSelected = columnOrder.filter((col) => selectedColumns.includes(col));
        setSelectedColumns(reorderedSelected);
        onClose();
      }}
      footer={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={selectAll}>Select All</button>
          <button className="btn-secondary" onClick={deselectAll}>Deselect All</button>
          <button className="btn-primary" onClick={() => {
            const reorderedSelected = columnOrder.filter((col) => selectedColumns.includes(col));
            setSelectedColumns(reorderedSelected);
            onClose();
          }}>Apply</button>
        </div>
      }
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
          {columnOrder.map((key) => (
            <DraggableItem
              key={key}
              id={key}
              checked={selectedColumns.includes(key)}
              onToggle={() => toggleColumn(key)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </ModalCard>
  );
};

export default ColumnModal;
