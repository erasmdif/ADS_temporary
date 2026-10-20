import { DataTb } from '@lad-sapienza/scms-core/components/DataTb';
import type { ColumnConfig } from '@lad-sapienza/scms-core/components/DataTb/types';

export default function AdvancedTable() {
  const data = [
    { id: 1, task: 'Fix MDX Props', priority: 'high', status: 'completed' },
    { id: 2, task: 'Add Custom Render', priority: 'medium', status: 'in_progress' },
    { id: 3, task: 'Write Documentation', priority: 'low', status: 'pending' },
  ];

  const columns: ColumnConfig[] = [
    { key: 'id', header: 'ID', width: '50px' },
    { key: 'task', header: 'Task Name' },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (val) => {
        const colors = {
          high: 'bg-danger',
          medium: 'bg-warning text-dark',
          low: 'bg-success'
        };
        return (
          <span className={`badge ${colors[val as keyof typeof colors] || 'bg-secondary'}`}>
            {String(val).toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => alert(`Clicked task: ${row.task}`)}
          className="btn btn-primary btn-sm"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <DataTb
      source={{ type: 'json', data }}
      columns={columns}
      searchable
    />
  );
}