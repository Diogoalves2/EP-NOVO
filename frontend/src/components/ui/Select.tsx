interface SelectProps {
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder: string;
}

export function Select({ name, required, defaultValue, children, className = '' }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

export function SelectTrigger({ children, className = '' }: SelectTriggerProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = '' }: SelectItemProps) {
  return (
    <option value={value} className={className}>
      {children}
    </option>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span>{placeholder}</span>;
} 