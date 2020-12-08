ffmpeg -i "$INPUT_FILE" -q:a 3 "$OUTPUT_FILE"
# this is only 	175 kb/s

#ffmpeg -i "$INPUT_FILE" -q:a 0 "$OUTPUT_FILE"
# this is only 245 kb/s

# best quality 320kb/s
#ffmpeg -i "$INPUT_FILE" -b:a 320k "$OUTPUT_FILE"
