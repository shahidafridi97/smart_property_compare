export const ICON_SIZE = 20;

const Svg = ({
  size = ICON_SIZE,
  viewBox = "0 0 24 24",
  className = "",
  children,
  ...props
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    width={size}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

/* MENU ICON (WORKING 100%) */
export const MenuIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <rect x="3" y="6" width="18" height="2" />
    <rect x="3" y="11" width="18" height="2" />
    <rect x="3" y="16" width="18" height="2" />
  </svg>
);

const icons = {
  menu: MenuIcon,
};

export function Icon({ name, ...props }) {
  const Cmp = icons[name];
  return Cmp ? <Cmp {...props} /> : null;
}