import React from 'react';
import { useParams } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from '@/components/common/Button';
import { InlineAlert } from '@/components/common/InlineAlert';
import * as doctorApi from '../apis/doctor.api';

type PrescriptionItem = {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
};

export const ConsultationSessionPage: React.FC = () => {
  const { appointmentId = '' } = useParams();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [message, setMessage] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [items, setItems] = React.useState<PrescriptionItem[]>([
    { medicationName: '', dosage: '', frequency: '', duration: '', notes: '' },
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const loadMessages = React.useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      await doctorApi.joinConsultation(appointmentId);
      setMessages(await doctorApi.getMessages(appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  React.useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const updateItem = (index: number, patch: Partial<PrescriptionItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div data-testid="consultation-session-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Session</h1>
        <p className="text-sm text-gray-500">Video call is out of scope; this screen uses chat fallback.</p>
      </div>

      {error && (
        <div data-testid="error-alert">
          <InlineAlert variant="error" title="Error" message={error} />
        </div>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <div data-testid="chat-message-list" className="mb-3 max-h-64 space-y-2 overflow-auto">
          {messages.length === 0 ? (
            <p data-testid="empty-state" className="text-sm text-gray-400">No messages yet.</p>
          ) : (
            messages.map((item) => (
              <div key={item.id ?? item.createdAt} className="rounded-lg bg-gray-100 p-2 text-sm dark:bg-slate-800">
                {item.content}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            data-testid="chat-message-input"
          />
          <Button
            data-testid="send-message"
            disabled={!message.trim() || loading}
            onClick={async () => {
              await doctorApi.sendMessage(appointmentId, message);
              setMessage('');
              loadMessages();
            }}
          >
            Send
          </Button>
          <Button data-testid="end-consultation" variant="danger" onClick={() => doctorApi.endConsultation(appointmentId)}>
            End
          </Button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h2 className="mb-2 font-semibold">Summary</h2>
        <InputTextarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={4}
          className="w-full"
          data-testid="consultation-summary-input"
        />
        <Button className="mt-3" data-testid="save-summary" onClick={() => doctorApi.saveSummary(appointmentId, summary)}>
          Save summary
        </Button>
      </section>

      <section data-testid="prescription-form" className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Prescription</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} data-testid="prescription-item-row" className="grid grid-cols-1 gap-2 md:grid-cols-5">
              {(['medicationName', 'dosage', 'frequency', 'duration', 'notes'] as const).map((field) => (
                <input
                  key={field}
                  className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                  placeholder={field}
                  value={item[field] ?? ''}
                  onChange={(event) => updateItem(index, { [field]: event.target.value })}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => setItems((prev) => [...prev, { medicationName: '', dosage: '', frequency: '', duration: '', notes: '' }])}>
            Add item
          </Button>
          <Button
            data-testid="save-prescription"
            onClick={() => doctorApi.createPrescription(appointmentId, { items })}
          >
            Save prescription
          </Button>
        </div>
      </section>
    </div>
  );
};
