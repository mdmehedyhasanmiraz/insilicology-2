// components/ui/progress.tsx

export function Progress({ value }: { value: number }) {
    return (
      <div className="w-full h-3 bg-gray-200 rounded-full">
        <div
          className="h-full bg-purple-600 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
  