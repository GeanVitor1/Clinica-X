import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, debounceTime, switchMap, tap } from 'rxjs';

/**
 * Debounce de busca (padrão 300ms) com switchMap para cancelar requisições anteriores.
 * Uso: const { setQuery, loading } = debounceSearch(q => service.getAll(q), (res) => items.set(res.items));
 */
export function debounceSearch$<T>(
  searchFn: (query: string) => Observable<T>,
  onResult: (result: T) => void,
  delay = 300,
  destroyRef?: DestroyRef
): { setQuery: (q: string) => void; loading: Signal<boolean> } {
  const destroy = destroyRef ?? inject(DestroyRef);
  const loading = signal(false);
  const search$ = new Subject<string>();

  search$
    .pipe(
      debounceTime(delay),
      tap(() => loading.set(true)),
      switchMap(q => searchFn(q)),
      takeUntilDestroyed(destroy)
    )
    .subscribe({
      next: result => {
        loading.set(false);
        onResult(result);
      },
      error: () => loading.set(false),
    });

  return {
    setQuery: (q: string) => search$.next(q),
    loading: loading.asReadonly(),
  };
}

/** Versão síncrona legada (filtro local). Preferir debounceSearch$ para API. */
export function debounceSearch<T>(
  searchFn: (query: string) => T[],
  delay = 300
): { query: Signal<string>; results: Signal<T[]>; setQuery: (q: string) => void } {
  const query = signal('');
  const search$ = new Subject<string>();

  const results = toSignal(
    search$.pipe(
      debounceTime(delay),
      switchMap(q => new Observable<T[]>(sub => {
        sub.next(searchFn(q));
        sub.complete();
      }))
    ),
    { initialValue: searchFn('') }
  );

  return {
    query: query.asReadonly(),
    results,
    setQuery: (q: string) => {
      query.set(q);
      search$.next(q);
    },
  };
}
