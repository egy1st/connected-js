//File: app/page.tsx

import Link from 'next/link';

const LevelBox = ({ level, color }: { level: string; color: string }) => (
  <div className={`bg-${color}-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300`}>
    <h3 className="font-normal text-2xl mt-3 mb-4">Level <span className="font-bold">{level}</span></h3>
    <Link href={`/levels/${level.toLowerCase()}`} className={`bg-${color}-500 text-white px-4 py-2 rounded hover:bg-${color}-600 transition-colors duration-300`}>
      Learn Now
    </Link>
  </div>
);

const LevelSection = ({ title, levels, colors }: { title: string; levels: string[]; colors: string[] }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold mb-6">{title} <span className="font-normal">Level</span></h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {levels.map((level, index) => (
        <LevelBox key={level} level={level} color={colors[index % colors.length]} />
      ))}
    </div>
  </section>
);

export default function Home() {
  const colors = ['blue', 'green', 'yellow', 'red'];

  return (
    <div className="container mx-auto px-4 py-8">
      <LevelSection 
        title="Beginner" 
        levels={['One', 'Two', 'Three', 'Four']} 
        colors={colors} 
      />
      <LevelSection 
        title="Intermediate" 
        levels={['Five', 'Six', 'Seven', 'Eight']} 
        colors={colors} 
      />
      <LevelSection 
        title="Advanced" 
        levels={['Nine', 'Ten', 'Eleven', 'Twelve']} 
        colors={colors} 
      />
    </div>
  );
}