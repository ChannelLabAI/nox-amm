# Equipment overlay configuration

`tamagotchi.js` contains the `EQUIPMENT_OVERLAYS` table. Add each new art set as
`item-id -> stage -> mood -> relative asset path`; `default` is allowed when one
transparent layer fits all moods. No renderer changes are required.

The `spider-preview` mood variants are verification-only examples; the sold
spider items use their own `adult -> default` layers in the main table.
Every other sold item with paper-doll art (including the lightweight and
golden-warrior sets) is registered the same way: one `adult -> default`
overlay per item — a transparent 48×48 source for `hat`, `clothes`, and
`handheld`, aligned to the adult character sprite, or a 96×96 source for
`background`. The renderer falls back to that default layer for every adult
mood; kitten and teen variants remain absent.
