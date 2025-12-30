import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrapper to make AssetTableRow sortable
export function SortableAssetRow({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 1000 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className="sortable-asset-row" {...attributes} {...listeners}>
            {children}
        </div>
    );
}

// Wrapper to make Groups sortable
export function SortableGroup({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '1rem'
    };

    return (
        <div ref={setNodeRef} style={style}>
            {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement<any>, { dragHandleProps: { ...attributes, ...listeners } })
                : children}
        </div>
    );
}

// Wrapper to make AssetCard sortable (Grid View)
export function SortableAssetCard({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        position: 'relative' as 'relative',
        zIndex: isDragging ? 10 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}
