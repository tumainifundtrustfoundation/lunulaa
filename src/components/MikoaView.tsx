import React from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  TrendingUp, 
  Compass, 
  CheckCircle 
} from 'lucide-react';

interface RankRow {
  rank: number;
  schoolName: string;
  region: string;
  gpa: number;
  div1: string;
  div2: string;
  div3: string;
  status: 'Kinara' | 'Mshindi' | 'Juu';
}

export default function MikoaView() {
  const standings: RankRow[] = [
    { rank: 1, schoolName: 'Kemebos Sec', region: 'Kagera', gpa: 1.02, div1: '98%', div2: '2%', div3: '0%', status: 'Kinara' },
    { rank: 2, schoolName: 'St. Francis Girls', region: 'Mbeya', gpa: 1.10, div1: '95%', div2: '5%', div3: '0%', status: 'Mshindi' },
    { rank: 3, schoolName: 'Waja Springs', region: 'Geita', gpa: 1.25, div1: '92%', div2: '7%', div3: '1%', status: 'Mshindi' },
    { rank: 4, schoolName: 'Feza Boys Sec', region: 'Dar es Salaam', gpa: 1.34, div1: '89%', div2: '10%', div3: '1%', status: 'Juu' },
    { rank: 5, schoolName: 'Canossa Sec', region: 'Dar es Salaam', gpa: 1.41, div1: '87%', div2: '12%', div3: '1%', status: 'Juu' },
    { rank: 6, schoolName: 'Marian Boys Sec', region: 'Pwani', gpa: 1.45, div1: '85%', div2: '14%', div3: '1%', status: 'Juu' },
    { rank: 7, schoolName: 'Ilboru Sec', region: 'Arusha', gpa: 1.50, div1: '84%', div2: '15%', div3: '1%', status: 'Juu' }
  ];

  return (
    <div id="mikoa-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-5xl mx-auto">
      
      {/* Standings Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Trophy size={12} /> NECTA National standings
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Viwango vya Shule Kitaifa (Standings)</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Kagua orodha rasmi ya viwango vya ufaulu wa shule za sekondari nchini Tanzania kulingana na matokeo ya NECTA Kidato cha Nne (CSEE) ya hivi karibuni.
          </p>
        </div>
      </section>

      {/* Standings table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-display font-bold text-slate-950 text-sm uppercase flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            Top 7 Shule Bora Kitaifa
          </h3>
          <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-3 py-1 rounded-full">NECTA CSEE 2025</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700 text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-150">
                <th className="p-4 w-12 text-center">Rang</th>
                <th className="p-4">Shule (School)</th>
                <th className="p-4">Mkoa (Region)</th>
                <th className="p-4 text-center">Div I</th>
                <th className="p-4 text-center">Div II</th>
                <th className="p-4 text-center">Div III</th>
                <th className="p-4 text-center w-24">Wastani GPA</th>
                <th className="p-4 text-center w-28">Hali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {standings.map((row) => (
                <tr key={row.rank} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-center font-display font-extrabold text-slate-500 text-sm">{row.rank}</td>
                  <td className="p-4 font-bold text-slate-900">{row.schoolName}</td>
                  <td className="p-4 text-slate-500">{row.region}</td>
                  <td className="p-4 text-center text-green-600 font-bold">{row.div1}</td>
                  <td className="p-4 text-center text-slate-500">{row.div2}</td>
                  <td className="p-4 text-center text-slate-500">{row.div3}</td>
                  <td className="p-4 text-center font-display font-extrabold text-cyan-700">{row.gpa}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                      row.status === 'Kinara' 
                        ? 'bg-amber-400/10 text-amber-500 border-amber-400/20' 
                        : row.status === 'Mshindi' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-cyan-100 text-cyan-700 border-cyan-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
