import React, { memo } from 'react';
import { useField } from 'formik';
import { Calendar, CalendarProps } from 'primereact/calendar';

export interface FormikCalendarProps {
  name: string;
  label?: string;
  placeholder?: string;
  showTime?: boolean;
  disabled?: boolean;
  minDate?: Date;
  showIcon?: boolean;
}

export const FormikCalendar: React.FC<FormikCalendarProps> = memo(({
  name,
  label,
  placeholder,
  showTime = false,
  disabled = false,
  minDate,
  showIcon = false,
}) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && meta.error;

  const handleChange: CalendarProps['onChange'] = (e) => {
    helpers.setValue(e.value);
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <Calendar
        id={name}
        value={field.value}
        onChange={handleChange}
        placeholder={placeholder}
        showTime={showTime}
        disabled={disabled}
        minDate={minDate}
        showIcon={showIcon}
        className={`w-full ${hasError ? 'p-invalid' : ''}`}
      />
      {hasError && <small className="p-error block mt-1">{meta.error}</small>}
    </div>
  );
});

FormikCalendar.displayName = 'FormikCalendar';
