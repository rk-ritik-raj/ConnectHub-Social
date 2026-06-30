import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 text-center">
      <h2 className="text-2xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">Page Not Found</h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-normal">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link to="/" className="text-[#0095f6] font-semibold hover:underline">
        Go Back to ConnectHub
      </Link>
    </div>
  );
};

export default NotFound;
