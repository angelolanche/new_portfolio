# Original portfolio inventory

Extracted on 2026-10-26 from [Angelo AoSol](https://www.angeloaosol.xyz/) and the [About page](https://www.angeloaosol.xyz/about).

The homepage contains 16 Wix video elements with 14 distinct media IDs. Repeated presentations of Coisa Numero 1 and 7 minutos de infinito share the same videos. AutoRRetrato and Midia Hell each retain two distinct files. Titles and contextual labels were associated using their positions in the source layout, rather than HTML ordering alone.

| Work                            | Context shown on the original site                                      | Unique videos |
| ------------------------------- | ----------------------------------------------------------------------- | ------------- |
| VJ set - Camera Roll            | Audio Rebel / 7th Synth Battle                                          | 1             |
| Frog Feelings                   | Live generative IA                                                      | 1             |
| Opening of Gallery 138          | —                                                                       | 1             |
| Monolito                        | —                                                                       | 1             |
| Coisa Numero 1                  | Exhibition Sentido Manifesto / 8th Parallel Art Exhibition / Casa Lebre | 1             |
| AutoRRetrato                    | —                                                                       | 2             |
| _ CEREBRO _                     | EMS Farmaceutica / MIS - SP                                             | 1             |
| Fibras Opticas                  | LUZ Art Lab                                                             | 1             |
| 7 minutos de infinito           | 22nd Serrinha Art Festival                                              | 1             |
| Midia Hell                      | Festa Animalia + Exposicao Hell de Janeiro                              | 2             |
| Delivery Room                   | BMW Agulhas Negras                                                      | 1             |
| A Quemosa Subversao Tecnologica | Amazonia Mapping                                                        | 1             |

`src/content/projects.ts` retains each media ID, original quality URL, lightweight preview URL, source dimensions and poster URL. Media streams directly from the original public Wix CDN; no video binaries or new services are added to the repository. All 14 originals, 14 previews and 14 posters returned HTTP 200. The BMW response also confirmed MP4 content, byte-range support and cross-origin access. Playback across all files has not been manually verified in a browser; this is a validation limit, not an active task.

`src/content/about.ts` preserves the published English About, including education, artistic practice and email. No personal claims or additional project descriptions were inferred. Existing `/projects/bmw` and `/projects/interactive-led-brain` links remain valid with the imported titles.
