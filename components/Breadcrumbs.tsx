import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-brand-charcoal/60">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-brand-taupe/60" aria-hidden="true">/</span>
            )}
            {item.path ? (
              <Link
                to={item.path}
                className="hover:text-brand-nudeGreen transition-colors focus:outline-none focus:ring-2 focus:ring-brand-nudeGreen focus:ring-offset-2 focus:ring-offset-transparent rounded"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-charcoal font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
