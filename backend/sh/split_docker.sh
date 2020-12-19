docker run -v "$PATH_TO_ROOT/music:/input" -v "$PATH_TO_ROOT/music:/output" -v "$PATH_TO_ROOT/pretrained_models:/model" researchdeezer/spleeter separate -i "/input/$INPUT_FILE" -o /output
