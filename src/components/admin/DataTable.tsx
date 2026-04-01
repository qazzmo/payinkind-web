import clsx from 'clsx'

interface Col<T> {
  key:      string
  header:   string
  width?:   string
  render:   (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  cols:        Col<T>[]
  rows:        T[]
  keyFn:       (row: T) => string
  emptyMsg?:   string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ cols, rows, keyFn, emptyMsg = 'No data', onRowClick }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {cols.map(c => (
              <th
                key={c.key}
                className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide"
                style={c.width ? { width: c.width } : {}}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                {emptyMsg}
              </td>
            </tr>
          )}
          {rows.map(row => (
            <tr
              key={keyFn(row)}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'border-b border-gray-50 last:border-none',
                onRowClick && 'cursor-pointer hover:bg-gray-50'
              )}
            >
              {cols.map(c => (
                <td key={c.key} className="px-4 py-3 text-gray-700">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
