import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-serif text-brand-charcoal mb-4">Accès refusé</h1>
          <p className="text-lg text-brand-charcoal/70 mb-2">
            Vous n'avez pas les droits pour accéder à cette page.
          </p>
          <p className="text-sm text-brand-charcoal/60">
            Un accès administrateur est requis.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-brand-nudeGreen text-white rounded-xl hover:bg-brand-nudeGreen/90 transition-colors font-medium"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
