const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;