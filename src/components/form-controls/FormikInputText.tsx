import React, { memo } from 'react';
import { useField } from 'formik';
import { InputText } from 'primereact/inputtext';

interface FormikInputTextProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export const FormikInputText: React.FC<FormikInputTextProps> = memo(({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
}) => {
  const [field, meta] = useField(name);
  const hasError = meta.touched && meta.error;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <InputText
        id={name}
        {...field}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${hasError ? 'p-invalid border-red-500' : ''}`}
      />
      {hasError && (
        <small className="text-red-500 text-xs mt-1 block">
          {meta.error}
        </small>
      )}
    </div>
  );
});

FormikInputText.displayName = 'FormikInputText';
