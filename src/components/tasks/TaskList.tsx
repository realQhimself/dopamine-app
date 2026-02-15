import { motion } from 'framer-motion';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { staggerContainer } from '../../lib/animations';

export function TaskList({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🎯</p>
        <p className="text-gray-500 text-sm">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </motion.div>
  );
}
