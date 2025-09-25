interface UrlInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  helperTextColor?: string;
}

export default function UrlInputField({
  value,
  onChange,
  placeholder = "https://example.com",
  helperText,
  helperTextColor = "text-gray-600"
}: UrlInputFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        埋め込みテスト対象URL：
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
      {helperText && (
        <p className={`text-sm ${helperTextColor} mt-1`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
