import React from 'react';
import { Clock } from 'lucide-react';

const TableSessionTimer = ({ occupiedAt, lastOrderTime }) => {
  const getSessionDuration = () => {
    if (!occupiedAt) return null;
    const occupied = new Date(occupiedAt);
    const now = new Date();
    const diff = Math.floor((now - occupied) / 1000 / 60); // dakika

    if (diff < 60) return `${diff} dk`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}sa ${mins}dk` : `${hours}sa`;
  };

  const getTimeSinceLastOrder = () => {
    if (!lastOrderTime) return null;
    const last = new Date(lastOrderTime);
    const now = new Date();
    const diff = Math.floor((now - last) / 1000 / 60);

    if (diff < 1) return 'Az önce';
    if (diff < 60) return `${diff} dk önce`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}sa ${mins}dk önce` : `${hours}sa önce`;
  };

  const duration = getSessionDuration();
  const lastOrder = getTimeSinceLastOrder();

  if (!duration) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium">
        <Clock size={14} />
        <span>{duration}</span>
      </div>
      {lastOrder && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Son sipariş: {lastOrder}
        </div>
      )}
    </div>
  );
};

export default TableSessionTimer;
