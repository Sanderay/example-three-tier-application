import { getRandomLyric } from './actions';

export default async function LyricWidget() {
  const lyric = await getRandomLyric();

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-4 mb-8">
      <p className="text-lg italic text-zinc-800 dark:text-zinc-100 mb-2">
        "{lyric.lyric}"
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        — {lyric.song} by {lyric.artist}
      </p>
    </div>
  );
}
