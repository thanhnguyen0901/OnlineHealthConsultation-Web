import React, { memo } from 'react';
import { useField } from 'formik';
import { Dropdown, DropdownProps } from 'primereact/dropdown';
import type { Option } from '@/types/common';

interface FormikDropdownProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

export const FormikDropdown: React.FC<FormikDropdownProps> = memo(({
  name,
  label,
  placeholder,
  options,
  disabled = false,
}) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && meta.error;

  const handleChange: DropdownProps['onChange'] = (e) => {
    helpers.setValue(e.value);
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <Dropdown
        id={name}
        value={field.value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${hasError ? 'p-invalid' : ''}`}
      />
      {hasError && <small className="p-error block mt-1">{meta.error}</small>}
    </div>
  );
});

FormikDropdown.displayName = 'FormikDropdown';
