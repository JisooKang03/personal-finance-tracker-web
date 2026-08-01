export function Skeleton({ height = '1rem', width = '100%' }: { height?: string; width?: string }) {
    return <div className="skeleton" style={{ height, width }} />;
  }
  
  export function CardSkeleton() {
    return (
      <div className="skeleton-card">
        <Skeleton height="0.85rem" width="40%" />
        <Skeleton height="1.6rem" width="60%" />
        <Skeleton height="0.75rem" width="50%" />
      </div>
    );
  }