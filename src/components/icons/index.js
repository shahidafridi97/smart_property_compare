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
export const BedIcon = (props) => (
  <Svg {...props}>
    <path d="M3 10h18v7H3z" />
    <path d="M3 10V7a2 2 0 0 1 2-2h4v5" />
  </Svg>
);

export const BathIcon = (props) => (
  <Svg {...props}>
    <path d="M3 12h18" />
    <path d="M5 12v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </Svg>
);

export const LocationIcon = (props) => (
  <Svg {...props}>
    <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </Svg>
);

export const CompareIcon = (props) => (
  <Svg {...props}>
    <path d="M10 3H5a2 2 0 0 0-2 2v5" />
    <path d="M14 21h5a2 2 0 0 0 2-2v-5" />
    <path d="M21 10V5a2 2 0 0 0-2-2h-5" />
    <path d="M3 14v5a2 2 0 0 0 2 2h5" />
  </Svg>
);

export const ArrowIcon = (props) => (
  <Svg {...props}>
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </Svg>
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
export const HomeIcon = (props) => (
  <Svg {...props}>
    <path d="M3 12l9-9 9 9" />
    <path d="M9 21V9h6v12" />
  </Svg>
);

export const StatusIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="4" />
  </Svg>
);

export const TagIcon = (props) => (
  <Svg {...props}>
    <path d="M20 10L12 2H4v8l8 8 8-8z" />
  </Svg>
);
/* UPDATE ICON MAP */
const icons = {
  menu: MenuIcon,
  bed: BedIcon,
  bath: BathIcon,
  location: LocationIcon,
  compare: CompareIcon,
  arrow: ArrowIcon,
   home: HomeIcon,
  status: StatusIcon,
  tag: TagIcon,
};


export function Icon({ name, ...props }) {
  const Cmp = icons[name];
  return Cmp ? <Cmp {...props} /> : null;
}