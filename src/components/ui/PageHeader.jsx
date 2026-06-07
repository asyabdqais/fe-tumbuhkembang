const PageHeader = ({ title, subtitle, action, children }) => (
  <div className="page-header">
    <div className="page-header-text">
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {(action || children) && (
      <div className="page-header-action">
        {action || children}
      </div>
    )}
  </div>
);

export default PageHeader;
