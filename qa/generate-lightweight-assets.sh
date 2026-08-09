#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-assets/equipment/sara}"
mkdir -p "$output_dir"

convert -size 96x96 xc:none +antialias \
  -fill '#0D1B32' -draw 'rectangle 0,0 95,43' \
  -fill '#142A49' -draw 'rectangle 0,24 95,47' \
  -fill '#A83A2D' -draw 'rectangle 8,12 87,15 rectangle 4,16 91,19 rectangle 1,20 94,23' \
  -fill '#F15B86' -draw 'rectangle 8,16 87,19 rectangle 4,20 91,23 rectangle 1,24 94,27' \
  -fill '#FFB02E' -draw 'rectangle 8,20 87,23 rectangle 4,24 91,27 rectangle 1,28 94,31' \
  -fill '#FFD34E' -draw 'rectangle 8,24 87,27 rectangle 4,28 91,31 rectangle 1,32 94,35' \
  -fill '#A7FF00' -draw 'rectangle 8,28 87,31 rectangle 4,32 91,35 rectangle 1,36 94,39' \
  -fill '#2EBB44' -draw 'rectangle 8,32 87,35 rectangle 4,36 91,39 rectangle 1,40 94,43' \
  -fill '#0D1B32' -draw 'rectangle 20,36 75,47 rectangle 28,32 67,39 rectangle 36,28 59,35' \
  -fill '#175C2C' -draw 'rectangle 0,44 95,63' \
  -fill '#2EBB44' -draw 'rectangle 0,48 95,67' \
  -fill '#222731' -draw 'polygon 0,68 95,68 95,95 0,95' \
  -fill '#175C2C' -draw 'polygon 28,68 67,68 82,95 13,95' \
  -fill '#A7FF00' -draw 'rectangle 8,58 13,62 rectangle 82,56 87,60 rectangle 18,73 21,81 rectangle 74,72 77,80' \
  -fill '#000000' -draw 'rectangle 10,42 14,66 rectangle 7,47 17,52 rectangle 78,43 82,66 rectangle 75,48 85,53' \
  -fill '#FFD34E' -draw 'rectangle 13,48 16,54 rectangle 81,49 84,55' \
  -fill '#E8EEF2' -draw 'rectangle 18,8 20,10 rectangle 74,7 77,10' \
  "$output_dir/rainbow-background-96px.png"

convert -size 96x96 xc:none +antialias \
  -fill '#0D1B32' -draw 'rectangle 0,0 95,44' \
  -fill '#142A49' -draw 'rectangle 0,24 95,47' \
  -fill '#667387' -draw 'polygon 0,47 0,35 16,23 28,39 42,19 62,43 76,27 95,46 95,55' \
  -fill '#B7C1CC' -draw 'polygon 0,40 16,23 23,33 28,39 42,19 51,31 62,43 76,27 85,38 95,46 95,58 0,58' \
  -fill '#E8EEF2' -draw 'polygon 0,48 16,28 21,35 27,39 42,23 49,34 61,46 76,31 83,40 95,49 95,67 0,67' \
  -fill '#F4F2E8' -draw 'rectangle 0,58 95,95' \
  -fill '#B7C1CC' -draw 'rectangle 0,68 95,71 rectangle 6,82 26,85 rectangle 70,78 91,81' \
  -fill '#222731' -draw 'polygon 35,95 46,61 50,61 62,95' \
  -fill '#303745' -draw 'polygon 42,95 48,68 55,95' \
  -fill '#000000' -draw 'rectangle 7,47 10,68 rectangle 4,51 13,55 rectangle 81,46 84,68 rectangle 78,50 87,54' \
  -fill '#A7FF00' -draw 'rectangle 8,54 11,61 rectangle 82,53 85,60' \
  -fill '#E8EEF2' -draw 'rectangle 17,8 20,11 rectangle 67,12 70,15 rectangle 79,5 82,8' \
  -fill '#A7FF00' -draw 'rectangle 87,15 89,23 rectangle 84,18 92,20' \
  "$output_dir/snowfield-background-96px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 14,0 28,1 rectangle 10,2 34,3 rectangle 8,4 36,6 rectangle 6,7 38,8' \
  -fill '#A83A2D' -draw 'rectangle 11,3 33,4 rectangle 9,5 35,6' \
  -fill '#F15B86' -draw 'rectangle 12,4 31,4 rectangle 10,5 33,6' \
  -fill '#000000' -draw 'rectangle 18,0 20,4 rectangle 24,0 26,4' \
  -fill '#175C2C' -draw 'rectangle 18,0 20,2 rectangle 24,0 26,2' \
  -fill '#2EBB44' -draw 'rectangle 20,1 24,3' \
  -fill '#E8EEF2' -draw 'rectangle 14,5 15,6 rectangle 28,5 29,6 rectangle 21,6 22,6' \
  -fill '#000000' -draw 'rectangle 5,7 39,8' \
  -fill '#A7FF00' -draw 'rectangle 8,7 36,7' \
  "$output_dir/strawberry-hat-hat-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 12,0 20,1 rectangle 9,2 21,8 rectangle 26,0 34,1 rectangle 25,2 37,8 rectangle 20,4 26,8' \
  -fill '#A92C58' -draw 'rectangle 10,2 19,7 rectangle 27,2 36,7' \
  -fill '#F15B86' -draw 'rectangle 12,1 18,5 rectangle 28,1 34,5' \
  -fill '#FFAAC1' -draw 'rectangle 12,2 13,3 rectangle 31,2 32,3' \
  -fill '#000000' -draw 'rectangle 19,3 27,8' \
  -fill '#A7FF00' -draw 'rectangle 21,4 25,8' \
  -fill '#E4FF78' -draw 'rectangle 22,4 24,5' \
  "$output_dir/bow-hat-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 13,0 31,2 rectangle 8,3 12,5 rectangle 32,3 36,5 rectangle 5,6 9,10 rectangle 35,6 39,10 rectangle 3,11 7,20 rectangle 37,11 41,20 rectangle 6,21 10,24 rectangle 34,21 38,24 rectangle 10,24 34,27' \
  -fill '#667387' -draw 'rectangle 14,1 30,2 rectangle 9,4 12,5 rectangle 32,4 35,5 rectangle 6,7 8,10 rectangle 36,7 38,10 rectangle 4,12 6,19 rectangle 38,12 40,19 rectangle 7,21 10,23 rectangle 34,21 37,23 rectangle 11,24 33,26' \
  -fill '#B7C1CC' -draw 'rectangle 16,1 24,1 rectangle 10,4 11,4 rectangle 7,8 7,11 rectangle 5,13 5,16' \
  -fill '#A7FF00' -draw 'rectangle 20,1 25,2 rectangle 4,14 6,18 rectangle 38,14 40,18 rectangle 18,25 26,26' \
  -fill '#E4FF78' -draw 'rectangle 21,1 24,1' \
  "$output_dir/space-helmet-hat-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 12,20 18,22 rectangle 27,20 33,22 rectangle 9,23 36,27 rectangle 8,28 14,39 rectangle 31,28 37,39 rectangle 14,26 31,42' \
  -fill '#142A49' -draw 'rectangle 13,21 17,22 rectangle 28,21 32,22 rectangle 10,24 18,27 rectangle 27,24 35,27 rectangle 9,28 13,38 rectangle 32,28 36,38 rectangle 14,27 18,40 rectangle 27,27 31,40' \
  -fill '#303745' -draw 'rectangle 11,25 17,26 rectangle 28,25 34,26 rectangle 10,29 12,35 rectangle 33,29 35,35 rectangle 15,28 17,38 rectangle 28,28 30,38' \
  -fill '#A7FF00' -draw 'rectangle 17,22 19,24 rectangle 26,22 28,24 rectangle 18,24 27,25 rectangle 12,29 13,31 rectangle 32,29 33,31 rectangle 16,37 20,39 rectangle 25,37 29,39' \
  -fill '#B7C1CC' -draw 'rectangle 21,27 24,29 rectangle 19,30 26,31' \
  "$output_dir/vest-clothes-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 12,19 17,21 rectangle 28,19 33,21 rectangle 8,22 37,26 rectangle 6,27 39,42 rectangle 10,43 35,45' \
  -fill '#0D1B32' -draw 'rectangle 13,20 16,21 rectangle 29,20 32,21 rectangle 9,23 36,26 rectangle 7,27 38,40 rectangle 9,41 36,42 rectangle 11,43 34,44' \
  -fill '#142A49' -draw 'rectangle 10,24 17,39 rectangle 28,24 35,39 rectangle 8,28 12,38 rectangle 33,28 37,38' \
  -fill '#A7FF00' -draw 'rectangle 21,22 24,25 rectangle 20,23 25,24 rectangle 12,29 13,30 rectangle 31,29 32,30 rectangle 16,35 17,36 rectangle 27,35 28,36' \
  -fill '#E8EEF2' -draw 'rectangle 15,26 16,27 rectangle 29,32 30,33' \
  "$output_dir/star-cloak-clothes-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 38,8 43,10 rectangle 36,11 40,13 rectangle 35,14 39,18 rectangle 34,19 38,24 rectangle 33,25 37,43 rectangle 36,42 42,46 rectangle 44,15 46,31 rectangle 42,30 47,34 rectangle 40,34 44,37' \
  -fill '#667387' -draw 'rectangle 39,9 42,10 rectangle 37,12 39,13 rectangle 36,15 38,18 rectangle 35,20 37,24 rectangle 34,26 36,42 rectangle 37,43 41,45' \
  -fill '#A7FF00' -draw 'rectangle 43,13 45,16 rectangle 44,17 45,30 rectangle 43,31 46,33' \
  -fill '#F15B86' -draw 'rectangle 42,34 46,36' \
  -fill '#E8EEF2' -draw 'rectangle 43,33 45,34' \
  "$output_dir/fishing-rod-handheld-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 34,12 43,14 rectangle 31,15 46,25 rectangle 33,26 44,29 rectangle 35,29 39,45 rectangle 32,17 35,20 rectangle 42,21 46,24' \
  -fill '#A92C58' -draw 'rectangle 35,14 42,15 rectangle 33,16 44,24 rectangle 35,25 42,27' \
  -fill '#F15B86' -draw 'rectangle 36,14 41,15 rectangle 34,16 40,23 rectangle 36,24 41,26' \
  -fill '#FFAAC1' -draw 'rectangle 35,17 36,19 rectangle 42,18 43,20' \
  -fill '#000000' -draw 'rectangle 37,18 40,25 rectangle 39,18 44,20' \
  -fill '#A7FF00' -draw 'rectangle 37,19 39,23 rectangle 40,18 43,20' \
  -fill '#B7C1CC' -draw 'rectangle 36,29 38,44' \
  -fill '#E8EEF2' -draw 'rectangle 36,30 37,36' \
  "$output_dir/lollipop-handheld-overlay-48px.png"

convert -size 48x48 xc:none +antialias \
  -fill '#000000' -draw 'rectangle 37,12 41,14 rectangle 34,15 44,18 rectangle 31,19 47,23 rectangle 33,24 45,42 rectangle 31,43 47,46' \
  -fill '#222731' -draw 'rectangle 38,13 40,14 rectangle 35,16 43,18 rectangle 32,20 46,22 rectangle 32,44 46,45' \
  -fill '#A7FF00' -draw 'rectangle 34,24 44,41' \
  -fill '#E4FF78' -draw 'rectangle 35,25 38,38 rectangle 39,25 43,28' \
  -fill '#175C2C' -draw 'rectangle 40,30 43,40 rectangle 34,38 43,41' \
  -fill '#000000' -draw 'rectangle 38,31 40,36 rectangle 36,33 42,35' \
  -fill '#E8EEF2' -draw 'rectangle 35,26 36,30' \
  "$output_dir/lantern-handheld-overlay-48px.png"

for file in \
  rainbow-background-96px.png snowfield-background-96px.png \
  strawberry-hat-hat-overlay-48px.png bow-hat-overlay-48px.png space-helmet-hat-overlay-48px.png \
  vest-clothes-overlay-48px.png star-cloak-clothes-overlay-48px.png \
  fishing-rod-handheld-overlay-48px.png lollipop-handheld-overlay-48px.png lantern-handheld-overlay-48px.png; do
  convert "$output_dir/$file" -strip "$output_dir/$file"
done
