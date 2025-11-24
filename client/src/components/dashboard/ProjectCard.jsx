import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderIcon, ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  formatDate,
  getStatusColor,
  getCategoryIcon,
} from "../../utils/helpers";
import { useAppStore } from "../../store/useAppStore";

const ProjectCard = memo(({ project, onDelete }) => {
  const { user } = useAppStore();


  const statusColor = useMemo(
    () => getStatusColor(project.status, "project"),
    [project.status]
  );

  const categoryIcon = useMemo(
    () => getCategoryIcon(project.category),
    [project.category]
  );

  const isOwner = useMemo(
    () => project.owner?._id === user?._id,
    [project.owner?._id, user?._id]
  );


  const handleDeleteClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDelete) {
        onDelete(project._id);
      }
    },
    [onDelete, project._id]
  );

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/dashboard/project/${project._id}`}>
        <div className="glass-card p-6 hover-lift h-full relative">
          {isOwner && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-4 right-4 p-2 text-red-500/80 hover:text-red-600 hover:bg-red-600/10 dark:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-all duration-200 z-10"
              title="Delete project"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-start justify-between mb-4 pr-8">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{categoryIcon}</span>
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {project.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {project.shortDescription || project.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`status-badge status-${statusColor}`}>
                {project.status.replace("-", " ")}
              </span>
              <span className="text-sm text-gray-600">
                {project.progress}% complete
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-2" />
              <span>Updated {formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {project.collaborators && project.collaborators.length > 0 && (
            <div className="mt-4 flex -space-x-2">
              {project.collaborators.slice(0, 3).map((collaborator, index) => (
                <img
                  key={collaborator._id || index}
                  src={
                    collaborator.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      collaborator.name || "User"
                    )}&background=8B5CF6&color=ffffff&size=128&bold=true`
                  }
                  alt={collaborator.name || "Collaborator"}
                  loading="lazy"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
              {project.collaborators.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{project.collaborators.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
