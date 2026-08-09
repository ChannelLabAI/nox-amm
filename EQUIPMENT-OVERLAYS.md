# Equipment overlay configuration

`tamagotchi.js` contains the `EQUIPMENT_OVERLAYS` table. Add each new art set as
`item-id -> stage -> mood -> relative asset path`; `default` is allowed when one
transparent layer fits all moods. No renderer changes are required.

The `spider-preview` mood variants are verification-only examples; the sold
spider items use their own `adult -> default` layers in the main table.
Lightweight shop items use one
`adult -> default` overlay: 48x48 transparent PNGs for `hat`, `clothes`, and
`handheld`, or 96x96 PNGs for `background`. The renderer falls back to that
default layer for every adult mood; kitten and teen variants remain absent.
