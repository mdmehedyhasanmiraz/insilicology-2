import React from "react";

interface Batch {
  id: string;
  batch_code: string;
  starts_on?: string;
  ends_on?: string;
  enrollment_deadline?: string;
  zoom_link?: string;
  max_students?: number;
}

export default function LiveCourseBatches({ batches }: { batches: Batch[] }) {
  if (!batches || batches.length === 0) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-purple-700 mb-2">Upcoming Batches</h2>
      <ul className="space-y-2">
        {batches.map(batch => (
          <li key={batch.id} className="p-3 border border-purple-100 rounded">
            <div className="font-semibold">Batch: {batch.batch_code}</div>
            <div>Starts: {batch.starts_on} | Ends: {batch.ends_on}</div>
            <div>Enroll by: {batch.enrollment_deadline}</div>
            {batch.max_students && <div>Max Students: {batch.max_students}</div>}
            {batch.zoom_link && <div>Zoom: <a href={batch.zoom_link} className="text-blue-600 underline">Join</a></div>}
          </li>
        ))}
      </ul>
    </div>
  );
} 