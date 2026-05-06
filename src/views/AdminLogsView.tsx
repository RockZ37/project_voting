import { AuditLog } from "@/src/types";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Download, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AdminLogsViewProps {
  logs: AuditLog[];
}

export function AdminLogsView({ logs }: AdminLogsViewProps) {
  const successCount = logs.filter((log) => String(log.status).toLowerCase() === "success").length;
  const rejectedCount = logs.filter((log) => String(log.status).toLowerCase() === "rejected").length;
  const successRate = logs.length ? `${Math.round((successCount / logs.length) * 100)}%` : "0%";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-on-surface">Secure Audit Logs</h1>
        <Button className="gap-2 font-bold">
          <Download size={18} />
          Export Ledger (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', val: String(logs.length) },
          { label: 'Rejected Events', val: String(rejectedCount) },
          { label: 'Success Rate', val: successRate },
          { label: 'Latest Event', val: logs[0] ? new Date(logs[0].timestamp).toLocaleTimeString() : '-' },
        ].map(s => (
          <Card key={s.label} className="p-5 space-y-1">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{s.label}</p>
            <p className="text-xl font-black text-primary">{s.val}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">Voter ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Source IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-surface-container-highest/30 transition-colors">
                <td className="px-6 py-4 text-on-surface-variant font-bold">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-primary">{log.type}</span>
                </td>
                <td className="px-6 py-4 text-on-surface font-bold uppercase">
                  {log.voterId}
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.1em]",
                    String(log.status).toLowerCase() === 'success' ? "bg-green-50 text-green-700" : 
                    String(log.status).toLowerCase() === 'rejected' ? "bg-error-container text-error" : "bg-yellow-50 text-yellow-700"
                  )}>
                    {log.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-outline">
                  {log.ip}
                </td>
              </tr>
            ))}
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-on-surface-variant">No logs available.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <div className="flex items-center gap-4 p-4 bg-primary-container text-on-primary-container rounded-lg border border-primary">
         <Clock className="shrink-0" />
         <p className="text-xs font-bold leading-tight">
            All logs are cryptographically sealed. Any tampering with the log history will result in an immediate system-wide integrity alert.
         </p>
      </div>
    </div>
  );
}

 
