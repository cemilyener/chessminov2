import { useState } from 'react';
import PgnImporter from './editor/PgnImporter';

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">PGN Test Sayfası</h1>
      <PgnImporter />
    </div>
  );
}