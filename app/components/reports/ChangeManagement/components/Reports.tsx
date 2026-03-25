import { FileText, Download, Share2, Printer, ExternalLink } from 'lucide-react';

export function Reports({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Reports</h2>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Exportable executive summaries and technical deep-dives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Executive Summary', 'Sentiment Analysis', 'Stakeholder Risk Matrix'].map((report) => (
          <div key={report} className="bg-white rounded-2xl border border-slate-200 p-6 group hover:border-indigo-600 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{report}</h3>
            <p className="text-xs font-medium text-slate-500 mb-6 italic">Last updated: Today, 09:00 AM</p>
            <div className="flex items-center gap-3">
              <button className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">Download</button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Share2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
