export type ResultValue<T> = { ok: true; value: T };
export type ResultError<E> = { ok: false; error: E };
export type Result<T, E> = ResultValue<T> | ResultError<E>;
