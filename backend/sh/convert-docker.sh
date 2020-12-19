docker run -v "$PATH_TO_MUSIC:$PATH_TO_MUSIC" -w "$PATH_TO_MUSIC" jrottenberg/ffmpeg -i "$INPUT_FILE" -q:a 3 "$OUTPUT_FILE"
