interface FrameContainerProps {
  id: string;
  placeholder?: string;
  borderStyle?: string;
  children?: React.ReactNode;
}

export default function FrameContainer({
  id,
  placeholder = "テスト結果がここに表示されます",
  borderStyle = "border-gray-300",
  children
}: FrameContainerProps) {
  return (
    <div id={id} className={`border-2 border-dashed ${borderStyle} rounded-lg p-4 min-h-[100px] mb-4`}>
      {children ? children : (
        <div className="text-gray-500 text-center">{placeholder}</div>
      )}
    </div>
  );
}
