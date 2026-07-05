type ExportColumn = {
  key: string;
  title: string;
  render?: (value: any, record: any) => string;
};

export const exportToCSV = (data: any[], columns: ExportColumn[], filename: string) => {
  const headers = columns.map(col => col.title).join(',');
  
  const rows = data.map(record => {
    return columns.map(col => {
      const value = col.render ? col.render(record[col.key], record) : record[col.key];
      const escaped = String(value ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};