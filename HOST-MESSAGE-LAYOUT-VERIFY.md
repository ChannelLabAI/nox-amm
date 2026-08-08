# Host visual verification: message-free farm layout

Chrome cannot run in the Codex sandbox (`setsockopt: Operation not permitted`).
After Bella approves the isolated patch, run these checks on an authorized host
against `tamagotchi-test.html` and save one screenshot for each viewport:

| Viewport | Farm before | Farm after | Increase | Shell fill |
| --- | ---: | ---: | ---: | ---: |
| 375x667 | 110.23px | 115.61px | 5.38px (4.88%) | 90.75% |
| 390x844 | 126.32px | 132.48px | 6.16px (4.88%) | 90.57% |
| 414x896 | 134.09px | 140.63px | 6.54px (4.88%) | 90.56% |
| 390x700 | 115.68px | 121.32px | 5.64px (4.88%) | 91.58% |
| 430x932 | 139.28px | 146.08px | 6.79px (4.88%) | 90.43% |

For every viewport, confirm `document.documentElement.scrollHeight <=
window.innerHeight`, the whole paw shell is visible, and the idle `#message`
has transparent text while retaining its original row. Click Feed, Play, and
Clean in turn: each feedback message should become visible in that same row,
without shifting `#menu` or changing `.farm` dimensions.

The figures use the approved v4 device geometry: screen height is 40.3061% of
the shell height; farm allocation changes from 41% to 43% of that screen.
