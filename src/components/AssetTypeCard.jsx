import React from "react";

const AssetTypeCard = ({
  title,
  count,
  icon: Icon,
  colorClass = "blue",
  isLoading = false,
}) => {
  const colorClasses = {
    blue: {
      gradient: "from-blue-600 to-blue-700",
      icon: "text-blue-600",
      bg: "bg-linear-to-br from-blue-100 to-blue-50",
      hover: "hover:border-blue-200 hover:shadow-xl",
      light: "from-blue-50",
    },
    red: {
      gradient: "from-red-600 to-red-700",
      icon: "text-red-600",
      bg: "bg-linear-to-br from-red-100 to-red-50",
      hover: "hover:border-red-200 hover:shadow-xl",
      light: "from-red-50",
    },
    indigo: {
      gradient: "from-indigo-600 to-indigo-700",
      icon: "text-indigo-600",
      bg: "bg-linear-to-br from-indigo-100 to-indigo-50",
      hover: "hover:border-indigo-200 hover:shadow-xl",
      light: "from-indigo-50",
    },
    pink: {
      gradient: "from-pink-600 to-pink-700",
      icon: "text-pink-600",
      bg: "bg-linear-to-br from-pink-100 to-pink-50",
      hover: "hover:border-pink-200 hover:shadow-xl",
      light: "from-pink-50",
    },
  };

  const colors = colorClasses[colorClass] || colorClasses.blue;

  return (
    <div className={`group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 ${colors.hover} transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative`}>
      <div className={`absolute inset-0 bg-linear-to-br ${colors.light} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? (
              <div className="h-8 w-20 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
            ) : (
              <span className={`bg-linear-to-r ${colors.gradient} bg-clip-text text-transparent animate-fadeIn`}>
                {count.toLocaleString()}
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {isLoading ? "Loading..." : "Total count"}
          </p>
        </div>
        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          {Icon && <Icon className={`w-8 h-8 ${colors.icon}`} />}
        </div>
      </div>
    </div>
  );
};

export default AssetTypeCard;
