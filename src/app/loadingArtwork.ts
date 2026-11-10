/** Give the initial HTML artwork a paint before evaluating the application. */
export async function showLoadingArtwork() {
  const loader = document.getElementById('boot-loader');
  const images = Array.from(loader?.querySelectorAll('img') ?? []);
  const results = await Promise.allSettled(
    images.map((image) => image.decode()),
  );
  if (results.every((result) => result.status === 'fulfilled'))
    loader?.classList.add('is-art-ready');
  // One callback runs before paint; the second yields a full rendering opportunity.
  // Failed images still leave the HTML loading caption available.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
