import React from "react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass = "blue",
  isLoading = false,
  badges = null,
}) => {
  const colorClasses = {
    blue: {
      gradient: "from-blue-600 to-blue-700",
      icon: "text-blue-600",
      bg: "bg-linear-to-br from-blue-100 to-blue-50",
      hover: "hover:border-blue-200 hover:shadow-xl",
      light: "from-blue-50",
    },
    green: {
      gradient: "from-green-600 to-green-700",
      icon: "text-green-600",
      bg: "bg-linear-to-br from-green-100 to-green-50",
      hover: "hover:border-green-200 hover:shadow-xl",
      light: "from-green-50",
    },
    orange: {
      gradient: "from-orange-600 to-orange-700",
      icon: "text-orange-600",
      bg: "bg-linear-to-br from-orange-100 to-orange-50",
      hover: "hover:border-orange-200 hover:shadow-xl",
      light: "from-orange-50",
    },
    purple: {
      gradient: "from-purple-600 to-purple-700",
      icon: "text-purple-600",
      bg: "bg-linear-to-br from-purple-100 to-purple-50",
      hover: "hover:border-purple-200 hover:shadow-xl",
      light: "from-purple-50",
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
    teal: {
      gradient: "from-teal-600 to-teal-700",
      icon: "text-teal-600",
      bg: "bg-linear-to-br from-teal-100 to-teal-50",
      hover: "hover:border-teal-200 hover:shadow-xl",
      light: "from-teal-50",
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
                {value}
              </span>
            )}
          </h3>
          {badges ? (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {badges}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2 font-medium">
              {isLoading ? "Loading..." : subtitle}
            </p>
          )}
        </div>
        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          {Icon && <Icon className={`w-8 h-8 ${colors.icon}`} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
