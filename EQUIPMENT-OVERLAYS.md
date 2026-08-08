# Equipment overlay configuration

`tamagotchi.js` contains the `EQUIPMENT_OVERLAYS` table. Add each new art set as
`item-id -> stage -> mood -> relative asset path`; `default` is allowed when one
transparent layer fits all moods. No renderer changes are required.

The verified spider entries are development-only examples and are not included
in `shop.js` `ITEMS`, so this change does not list or sell the spider set.
