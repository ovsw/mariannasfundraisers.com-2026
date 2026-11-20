# Raster image descriptions

Use `pnpm raster:sync` to copy Raster AI descriptions into the searchable
`description` field on matching Sanity image assets. Sanity keeps the images;
Raster supplies descriptions. The command does not copy tags or change alt text.

## When to use Raster

Use Raster only for large batches, such as hundreds of photos at once. For a
few images, look at each image and write its `description` on the
`sanity.imageAsset` document yourself. Follow the style of the existing
descriptions: one or two plain sentences that say what the image shows.

## Setup

When you set up the Website, add these optional keys to `studio/.env.local`:

```dotenv
RASTER_API_KEY=<Raster API key>
RASTER_ORG_ID=<Raster organization ID>
RASTER_LIBRARY_ID=<this Website's Raster library ID>
```

`RASTER_LIBRARY_ID` is this Website's own Raster library. The Raster
organization also holds other clients' libraries, so the command never
guesses a library: without `RASTER_LIBRARY_ID` and without `--library`, it
stops and names the setting. Never upload this Website's images to another
client's library.

Grant the API key access to that library. Keep these names
without the `SANITY_STUDIO_` prefix, which exposes values in the Studio bundle.
The command also needs `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`,
and `SANITY_AUTH_TOKEN`. The token needs asset write access for `--apply`.
The command loads `studio/.env.local`; existing shell values take precedence.

## Sync new images

1. Upload the images to the Sanity media library. Keep the original file names.
2. Upload the same files, with the same names, to this Website's Raster
   library (`RASTER_LIBRARY_ID`).
3. Wait until Raster shows a description for each image.
4. Run `pnpm raster:sync` from the repository root. Check the printed Sanity
   project, dataset, library, proposed images, and skipped stems. The first
   line names the library and whether it came from `RASTER_LIBRARY_ID` or
   `--library`. `--library <id>` overrides `RASTER_LIBRARY_ID` for one run;
   grant the API key access to that library first.
5. Before a write, follow the full asset backup procedure in
   [Sanity CLI](sanity-cli.md#authorized-dataset-writes). Verify the backup.
6. Run `pnpm raster:sync --apply` with the same target. If the dry run used
   `--library <id>`, repeat it: `pnpm raster:sync --library <id> --apply`.
   Without it, the command writes from `RASTER_LIBRARY_ID`, which is not the
   library you checked.
7. Run the dry run again, with the same `--library <id>` if you used one. It
   must report `To patch: 0` for unchanged inputs.
8. In Studio Media, search a word from a new description and check the result.

## Matching and skipped images

The stem is the original Sanity filename without its last extension, with
surrounding spaces removed and letters converted to lowercase. Raster already
removes the extension from its asset name. The command compares that name,
with spaces removed at each end and letters converted to lowercase, to the
Sanity stem. Names with internal dots keep those dots.

A match needs exactly one Raster asset and one Sanity asset. Duplicate Raster
names are ambiguous even if their descriptions agree or one is still empty.
Duplicate Sanity stems, such as `cabin.jpg` and `cabin.png`, are also skipped.
The dry run lists ambiguous stems. Rename conflicting files before uploading;
never rename only one copy. Undescribed Raster images are skipped.

The command fills empty descriptions and keeps existing descriptions.
`--overwrite` replaces an existing description when it differs from Raster.
Only `description` changes. Transactions contain at most 50 patches and check
asset revisions to prevent overwriting concurrent edits. If a transaction
fails, earlier transactions remain applied. Inspect the failure and run again;
already matching descriptions need no write.
