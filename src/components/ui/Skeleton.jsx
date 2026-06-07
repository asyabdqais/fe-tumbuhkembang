const Skeleton = ({ width = '100%', height = 12, circle = false, style = {}, className = '' }) => (
  <span
    className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`}
    style={{ width, height, ...style }}
    aria-hidden="true"
  />
);

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="data-table" aria-hidden="true">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <Skeleton width={index === 0 ? 90 : 70} height={10} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <td key={columnIndex}>
                {columnIndex === 0 ? (
                  <div className="skeleton-row">
                    <Skeleton width={32} height={32} circle />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="70%" height={12} style={{ marginBottom: 7 }} />
                      <Skeleton width="42%" height={10} />
                    </div>
                  </div>
                ) : (
                  <Skeleton width={columnIndex === columns - 1 ? 96 : '72%'} height={12} />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CardListSkeleton = ({ rows = 4 }) => (
  <div className="skeleton-card" aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="skeleton-row"
        style={{
          padding: index === 0 ? '0 0 14px' : '14px 0',
          borderBottom: index === rows - 1 ? 'none' : '1px solid #f3f4f6',
        }}
      >
        <Skeleton width={34} height={34} circle />
        <div style={{ flex: 1 }}>
          <Skeleton width="62%" height={13} style={{ marginBottom: 8 }} />
          <Skeleton width="38%" height={10} />
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = ({ height = 260 }) => (
  <div className="skeleton-card" style={{ height }} aria-hidden="true">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <Skeleton width={150} height={14} style={{ marginBottom: 8 }} />
        <Skeleton width={95} height={10} />
      </div>
      <Skeleton width={28} height={28} circle />
    </div>
    <div style={{ height: height - 100, display: 'flex', alignItems: 'end', gap: 12 }}>
      {[48, 72, 55, 84, 64, 92, 70].map((value, index) => (
        <Skeleton key={index} width="100%" height={`${value}%`} style={{ flex: 1, borderRadius: 6 }} />
      ))}
    </div>
  </div>
);

export const StatCardsSkeleton = ({ count = 3 }) => (
  <div className="skeleton-grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-card skeleton-row">
        <Skeleton width={48} height={48} circle />
        <div style={{ flex: 1 }}>
          <Skeleton width="55%" height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="35%" height={28} />
        </div>
      </div>
    ))}
  </div>
);

export const FieldSkeleton = () => (
  <div aria-hidden="true">
    <Skeleton width={92} height={10} style={{ marginBottom: 7 }} />
    <Skeleton width="100%" height={38} />
  </div>
);

export const PageSkeleton = () => (
  <div aria-hidden="true">
    <div className="page-header">
      <div>
        <Skeleton width={210} height={22} style={{ marginBottom: 8 }} />
        <Skeleton width={150} height={12} />
      </div>
      <Skeleton width={140} height={36} />
    </div>
    <div className="skeleton-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      <CardListSkeleton rows={5} />
      <ChartSkeleton />
    </div>
  </div>
);

export default Skeleton;
