import * as Icons from 'lucide-react';

const Icon = ({ name, color = 'currentColor', size = 20, ...props }) => {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon color={color} size={size} {...props} />;
};

export default Icon;