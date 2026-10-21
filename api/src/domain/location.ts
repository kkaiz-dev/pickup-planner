// docs/design/02-how.md の「地点」。v1 では緯度経度を扱わず、ラベル（文字列）だけで区別する。
export type Location = {
  readonly label: string;
};

export function location(label: string): Location {
  return { label };
}
