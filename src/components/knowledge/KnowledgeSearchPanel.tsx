import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useKnowledgeSearch } from '../../features/knowledge/hooks';
import { preview } from '../../features/knowledge/knowledgeUtils';
import type { SearchMode } from '../../features/knowledge/types';
import { getErrorMessage } from '../../utils/apiError';

/** Lets a business check what the assistant would find for a customer's question. */
export function KnowledgeSearchPanel({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('keyword');
  const search = useKnowledgeSearch();
  const results = search.data;

  return (
    <section aria-labelledby="kb-search-heading" className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 id="kb-search-heading" className="font-semibold">
        Test what your assistant can find
      </h3>
      <form
        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = query.trim();
          if (trimmed) search.mutate({ query: trimmed, knowledgeBaseIds: [knowledgeBaseId], mode });
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="kb-search-query">A customer’s question</Label>
          <Input
            id="kb-search-query"
            value={query}
            maxLength={2000}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="How long do I have to return an item?"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="kb-search-mode">Search type</Label>
          <select
            id="kb-search-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as SearchMode)}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="keyword">Keywords (like website chat)</option>
            <option value="semantic">By meaning (needs indexing)</option>
          </select>
        </div>
        <Button type="submit" disabled={search.isPending || query.trim() === ''}>
          <Search className="mr-2 h-4 w-4" aria-hidden="true" />
          {search.isPending ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {search.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {getErrorMessage(search.error, 'The search could not be completed.')}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {mode === 'keyword'
            ? 'Nothing found. Only published documents are searched.'
            : 'Nothing found. Meaning-based search only finds documents that have been indexed.'}
        </p>
      )}

      {results && results.length > 0 && (
        <ol className="space-y-2" aria-label="Search results">
          {results.map((r, index) => (
            <li key={r.id ?? `${r.knowledgeDocumentId ?? 'result'}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
              <div className="font-medium">
                {r.title ?? 'Untitled'}
                {typeof r.score === 'number' && <span className="ml-2 text-xs font-normal text-slate-500">score {Number(r.score.toFixed(2))}</span>}
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{preview(r.content, 280)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}