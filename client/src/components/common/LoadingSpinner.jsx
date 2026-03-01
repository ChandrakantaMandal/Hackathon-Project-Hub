const LoadingSpinner = ({ size = "md", text }) => {
  const sizeMap = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-[3px]",
    lg: "w-14 h-14 border-4",
    xl: "w-20 h-20 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* soft pulse background */}
        <div
          className={`
            ${sizeMap[size]}
            absolute
            rounded-full
            bg-indigo-500/10
            blur-md
            animate-pulse
          `}
        />

        {/* static ring */}
        <div
          className={`
            ${sizeMap[size]}
            rounded-full
            border-gray-200 dark:border-gray-700
          `}
        />

        {/* spinning gradient ring */}
        <div
          className={`
            ${sizeMap[size]}
            absolute inset-0
            rounded-full
            border-transparent
            border-t-indigo-600
            border-r-purple-500
            animate-spin
          `}
          style={{ animationDuration: "0.9s" }}
        />
      </div>

      {text && (
        <span className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-300">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;