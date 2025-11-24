import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UsersIcon, FolderIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/helpers";
import { useAppStore } from "../../store/useAppStore";

const TeamCard = memo(({ team, onDelete, showMembershipStatus = false }) => {
  const { user } = useAppStore();


  const isOwner = useMemo(
    () => team.owner?._id === user?._id || team.owner === user?._id,
    [team.owner, user?._id]
  );

  const handleDeleteClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDelete) {
        onDelete(team._id);
      }
    },
    [onDelete, team._id]
  );

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-6 hover:shadow-lg transition-all duration-300 relative"
    >
      {isOwner && onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 right-4 p-2 text-red-500/80 hover:text-red-600 hover:bg-red-600/10 dark:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-all duration-200 z-10"
          title="Delete team"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
      {showMembershipStatus && (
        <div className="mb-3">
          {team.isMember ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Member ({team.memberRole})
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
              Not a member
            </span>
          )}
        </div>
      )}

      <Link to={`/dashboard/team/${team._id}`} className="block">
        <div className="flex items-start justify-between mb-4 pr-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2 truncate">
              {team.name}
            </h3>
            {team.description && (
              <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-2">
                {team.description}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-gray-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
            <UsersIcon className="w-4 h-4 mr-2" />
            <span>{team.members?.length || 0} members</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
            <FolderIcon className="w-4 h-4 mr-2" />
            <span>{team.projects?.length || 0} projects</span>
          </div>

          <div className="text-xs text-gray-500 dark:text-slate-500">
            Created {formatDate(team.createdAt)}
          </div>
        </div>

        {team.members && team.members.length > 0 && (
          <div className="mt-4 flex -space-x-2">
            {team.members.slice(0, 3).map((member, index) => (
              <img
                key={member._id || index}
                src={
                  member.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    member.user?.name || "User"
                  )}&background=8B5CF6&color=ffffff&size=128&bold=true`
                }
                alt={member.user?.name || "Team member"}
                loading="lazy"
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
              />
            ))}
            {team.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                  +{team.members.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
});

TeamCard.displayName = "TeamCard";

export default TeamCard;
