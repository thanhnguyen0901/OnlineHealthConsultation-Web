import React, { memo } from 'react';
import { useField } from 'formik';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export interface FormikInputTextProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  as?: string;
  rows?: number;
  autoComplete?: string;
}

export const FormikInputText: React.FC<FormikInputTextProps> = memo(
  ({ name, label, placeholder, type = 'text', disabled = false, as, rows, autoComplete }) => {
    const [field, meta] = useField(name);
    const hasError = meta.touched && meta.error;

    const isTextarea = as === 'textarea';

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
        {isTextarea ? (
          <InputTextarea
            id={name}
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows || 3}
            className={`w-full ${hasError ? 'p-invalid border-red-500' : ''}`}
          />
        ) : (
          <InputText
            id={name}
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`w-full ${hasError ? 'p-invalid border-red-500' : ''}`}
          />
        )}
        {hasError && <small className="text-red-500 text-xs mt-1 block">{meta.error}</small>}
      </div>
    );
  }
);

FormikInputText.displayName = 'FormikInputText';
